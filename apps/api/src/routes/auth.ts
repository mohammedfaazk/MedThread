import { Router } from 'express';
import { prisma } from '@medthread/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
  role: z.enum(['PATIENT', 'DOCTOR', 'NURSE', 'MEDICAL_STUDENT', 'PHARMACIST', 'ADMIN'])
});

authRouter.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: existingUser.email === data.email
          ? 'Email already registered'
          : 'Username already taken'
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
        role: data.role
      }
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return res.status(400).json({
        success: false,
        error: `${firstError.path.join('.')}: ${firstError.message}`
      });
    }

    res.status(400).json({ success: false, error: 'Registration failed' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          doctorVerificationStatus: user.doctorVerificationStatus
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ success: false, error: 'Login failed' });
  }
});

// Password verification endpoint for chat access
authRouter.post('/verify-password', async (req, res) => {
  try {
    console.log('\n🔐 PASSWORD VERIFICATION REQUEST');
    console.log('═'.repeat(50));
    
    // Development bypass option
    if (process.env.BYPASS_CHAT_PASSWORD === 'true') {
      console.log('⚠️  DEVELOPMENT MODE: Password verification bypassed');
      console.log('═'.repeat(50));
      return res.json({ success: true, message: 'Password verification bypassed (dev mode)' });
    }
    
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    console.log('✅ Token decoded:', { userId: decoded.userId, role: decoded.role });
    
    const { password } = req.body;
    
    if (!password) {
      console.log('❌ No password provided');
      return res.status(400).json({ success: false, error: 'Password required' });
    }
    
    console.log('📝 Password received (length):', password.length);
    console.log('📝 Password first 3 chars:', password.substring(0, 3));
    console.log('📝 Full password (for debugging):', password);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        passwordHash: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found:', decoded.userId);
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    console.log('✅ User found:', {
      username: user.username,
      email: user.email,
      role: user.role,
      hasPasswordHash: !!user.passwordHash,
      passwordHashLength: user.passwordHash?.length || 0,
      passwordHashPrefix: user.passwordHash?.substring(0, 10) || 'none'
    });
    
    // Show expected passwords for common doctor accounts (development only)
    const expectedPasswords: Record<string, string> = {
      'watson@gmail.com': 'Watson@123456',
      'dr.mitchell@medthread.com': 'Mitchell@123456',
      'rifa@gmail.com': 'Rifa@123456',
      'test.doctor.1773995866829@example.com': 'TestDoc@123456',
      'login.test.doctor.1773995919045@example.com': 'LoginTest@123456'
    };
    
    if (expectedPasswords[user.email]) {
      console.log('💡 Expected password for this account:', expectedPasswords[user.email]);
      console.log('📝 Received password:', password);
      console.log('🔍 Passwords match?', password === expectedPasswords[user.email]);
    }
    
    console.log('🔍 Comparing password with hash...');
    const isValid = await bcrypt.compare(password, user.passwordHash);
    console.log('🔐 Comparison result:', isValid ? '✅ VALID' : '❌ INVALID');
    
    if (!isValid) {
      console.log('❌ Password verification FAILED for:', user.email);
      if (expectedPasswords[user.email]) {
        console.log('💡 HINT: The correct password for this account is:', expectedPasswords[user.email]);
      }
      console.log('═'.repeat(50));
      return res.status(401).json({ success: false, error: 'Invalid password' });
    }
    
    console.log('✅ Password verification SUCCESS for:', user.email);
    console.log('═'.repeat(50));
    res.json({ success: true, message: 'Password verified' });
  } catch (error) {
    console.error('❌ Password verification error:', error);
    console.log('═'.repeat(50));
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
});

export default authRouter;

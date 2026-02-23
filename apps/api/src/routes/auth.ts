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
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password required' });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid password' });
    }
    
    res.json({ success: true, message: 'Password verified' });
  } catch (error) {
    console.error('Password verification error:', error);
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
});

export default authRouter;

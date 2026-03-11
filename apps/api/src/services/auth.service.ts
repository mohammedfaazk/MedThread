import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@medthread/database';
import { config } from '../config';
import { ConflictError, UnauthorizedError } from '../utils/errors';

interface RegisterInput {
  email: string;
  username: string;
  password: string;
  role: 'PATIENT' | 'DOCTOR' | 'NURSE' | 'MEDICAL_STUDENT' | 'PHARMACIST';
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    doctorVerificationStatus?: string;
    avatar?: string;
    banner?: string;
    bio?: string;
    specialty?: string;
  };
}

export class AuthService {
  private readonly SALT_ROUNDS = 12;

  async register(input: RegisterInput): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input.email },
          { username: input.username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === input.email) {
        throw new ConflictError('Email already registered');
      }
      throw new ConflictError('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, this.SALT_ROUNDS);

    // Create user with doctor verification status if role is DOCTOR
    const user = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash,
        role: input.role,
        doctorVerificationStatus: input.role === 'DOCTOR' ? 'PENDING' : null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        doctorVerificationStatus: true,
        avatar: true,
        banner: true,
        bio: true,
        specialty: true,
      }
    });

    // Generate token
    const token = this.generateToken(user.id, user.role);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        doctorVerificationStatus: user.doctorVerificationStatus || undefined,
        avatar: user.avatar || undefined,
        banner: user.banner || undefined,
        bio: user.bio || undefined,
        specialty: user.specialty || undefined,
      },
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    // Log the login attempt (without password)
    console.log('🔐 Login attempt:', { 
      email: input.email,
      timestamp: new Date().toISOString() 
    });

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        passwordHash: true,
        isSuspended: true,
        doctorVerificationStatus: true,
        avatar: true,
        banner: true,
        bio: true,
        specialty: true,
      }
    });

    if (!user) {
      console.log('❌ User not found:', input.email);
      throw new UnauthorizedError('Invalid email or password');
    }

    console.log('✅ User found:', { 
      email: user.email, 
      username: user.username,
      role: user.role,
      hasPasswordHash: !!user.passwordHash,
      passwordHashLength: user.passwordHash?.length || 0
    });

    // Check if user is suspended
    if (user.isSuspended) {
      console.log('⛔ User suspended:', user.email);
      throw new UnauthorizedError('Account suspended. Please contact support.');
    }

    // Check if passwordHash exists
    if (!user.passwordHash) {
      console.log('❌ No password hash for user:', user.email);
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    console.log('🔍 Comparing password...');
    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    console.log('🔐 Password validation result:', isValidPassword ? '✅ VALID' : '❌ INVALID');

    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user.id, user.role);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        doctorVerificationStatus: user.doctorVerificationStatus || undefined,
        avatar: user.avatar || undefined,
        banner: user.banner || undefined,
        bio: user.bio || undefined,
        specialty: user.specialty || undefined,
      },
    };
  }

  async verifyToken(token: string): Promise<{ userId: string; role: string }> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; role: string };
      return decoded;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  async refreshToken(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isSuspended: true }
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.isSuspended) {
      throw new UnauthorizedError('Account suspended');
    }

    return this.generateToken(user.id, user.role);
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true }
    });

    if (!user || !user.passwordHash) {
      return false;
    }

    return await bcrypt.compare(password, user.passwordHash);
  }

  private generateToken(userId: string, role: string): string {
    return jwt.sign(
      { userId, role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
    );
  }
}

export const authService = new AuthService();

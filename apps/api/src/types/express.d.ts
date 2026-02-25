import { UserRole, DoctorVerificationStatus } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        role: UserRole;
        doctorVerificationStatus?: DoctorVerificationStatus | null;
      };
    }
  }
}

export {};

import { prisma } from '@medthread/database';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';
import { emailService } from './email.service';
import { notificationService } from './notification.service';
import { NotificationType } from '@prisma/client';

interface DoctorRegistrationData {
  medicalLicenseNumber: string;
  licenseIssuingAuthority: string;
  licenseExpiryDate: Date;
  specialty: string;
  subSpecialty?: string;
  yearsOfExperience: number;
  hospitalAffiliation?: string;
  clinicAddress?: string;
}

interface KYCDocuments {
  idProof: string; // URL or base64
  medicalDegree: string;
  licenseDocument: string;
  additionalCertificates?: string[];
}

export class DoctorVerificationService {
  /**
   * Doctor submits verification request with KYC documents
   */
  async submitVerificationRequest(
    userId: string,
    data: DoctorRegistrationData,
    documents: KYCDocuments
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role !== 'DOCTOR') {
      throw new ForbiddenError('Only users with DOCTOR role can submit verification');
    }

    if (user.doctorVerificationStatus === 'APPROVED') {
      throw new ValidationError('Doctor is already verified');
    }

    if (user.doctorVerificationStatus === 'UNDER_REVIEW') {
      throw new ValidationError('Verification request is already under review');
    }

    // Validate license expiry date
    if (new Date(data.licenseExpiryDate) < new Date()) {
      throw new ValidationError('Medical license has expired');
    }

    // Update user with verification data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        doctorVerificationStatus: 'UNDER_REVIEW',
        medicalLicenseNumber: data.medicalLicenseNumber,
        licenseIssuingAuthority: data.licenseIssuingAuthority,
        licenseExpiryDate: data.licenseExpiryDate,
        specialty: data.specialty,
        subSpecialty: data.subSpecialty,
        yearsOfExperience: data.yearsOfExperience,
        hospitalAffiliation: data.hospitalAffiliation,
        clinicAddress: data.clinicAddress,
        kycDocuments: documents as any,
        verificationDocuments: {},
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        doctorVerificationStatus: true,
        specialty: true,
      }
    });

    return {
      message: 'Verification request submitted successfully. You will be notified once reviewed.',
      user: updatedUser,
    };
  }

  /**
   * Get all pending verification requests (Admin only)
   */
  async getPendingVerifications(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: 'DOCTOR',
          doctorVerificationStatus: {
            in: ['PENDING', 'UNDER_REVIEW']
          }
        },
        select: {
          id: true,
          username: true,
          email: true,
          doctorVerificationStatus: true,
          medicalLicenseNumber: true,
          licenseIssuingAuthority: true,
          licenseExpiryDate: true,
          specialty: true,
          subSpecialty: true,
          yearsOfExperience: true,
          hospitalAffiliation: true,
          clinicAddress: true,
          medicalUniversity: true,
          graduationYear: true,
          kycDocuments: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({
        where: {
          role: 'DOCTOR',
          doctorVerificationStatus: {
            in: ['PENDING', 'UNDER_REVIEW']
          }
        }
      })
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get all verified doctors
   */
  async getVerifiedDoctors(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: 'DOCTOR',
          doctorVerificationStatus: 'APPROVED'
        },
        select: {
          id: true,
          username: true,
          email: true,
          specialty: true,
          subSpecialty: true,
          yearsOfExperience: true,
          hospitalAffiliation: true,
          avatar: true,
          bio: true,
          totalKarma: true,
          verifiedAt: true,
          createdAt: true,
        },
        orderBy: { verifiedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({
        where: {
          role: 'DOCTOR',
          doctorVerificationStatus: 'APPROVED'
        }
      })
    ]);

    return {
      doctors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get verification request details (Admin only)
   */
  async getVerificationDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        doctorVerificationStatus: true,
        medicalLicenseNumber: true,
        licenseIssuingAuthority: true,
        licenseExpiryDate: true,
        specialty: true,
        subSpecialty: true,
        yearsOfExperience: true,
        hospitalAffiliation: true,
        clinicAddress: true,
        kycDocuments: true,
        verificationDocuments: true,
        verificationNotes: true,
        verifiedAt: true,
        verifiedBy: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role !== 'DOCTOR') {
      throw new ValidationError('User is not a doctor');
    }

    return user;
  }

  /**
   * Approve doctor verification (Admin only)
   */
  async approveVerification(userId: string, adminId: string, notes?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role !== 'DOCTOR') {
      throw new ValidationError('User is not a doctor');
    }

    if (user.doctorVerificationStatus === 'APPROVED') {
      throw new ValidationError('Doctor is already verified');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        doctorVerificationStatus: 'APPROVED',
        verified: true,
        verifiedAt: new Date(),
        verifiedBy: adminId,
        verificationNotes: notes,
        rejectionReason: null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        doctorVerificationStatus: true,
        specialty: true,
        verifiedAt: true,
      }
    });

    // Create VERIFICATION_STATUS notification
    try {
      await notificationService.createNotification({
        type: NotificationType.VERIFICATION_STATUS,
        recipientIds: [userId],
        actorId: adminId,
        metadata: {
          title: 'Verification Approved',
          body: 'Your doctor verification has been approved! You can now access all doctor features.',
          link: '/doctor-verification',
          status: 'APPROVED',
        }
      });
    } catch (notifError) {
      console.error('Failed to create verification approval notification:', notifError);
    }

    // Send notification/email to doctor
    try {
      await emailService.sendVerificationApprovedEmail(updatedUser.email, updatedUser.username);
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }

    return {
      message: 'Doctor verification approved successfully',
      user: updatedUser,
    };
  }

  /**
   * Reject doctor verification (Admin only)
   */
  async rejectVerification(userId: string, adminId: string, reason: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role !== 'DOCTOR') {
      throw new ValidationError('User is not a doctor');
    }

    if (!reason || reason.trim().length < 10) {
      throw new ValidationError('Rejection reason must be at least 10 characters');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        doctorVerificationStatus: 'REJECTED',
        verified: false,
        verifiedBy: adminId,
        rejectionReason: reason,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        doctorVerificationStatus: true,
        rejectionReason: true,
      }
    });

    // Create VERIFICATION_STATUS notification
    try {
      await notificationService.createNotification({
        type: NotificationType.VERIFICATION_STATUS,
        recipientIds: [userId],
        actorId: adminId,
        metadata: {
          title: 'Verification Rejected',
          body: 'Your doctor verification request has been rejected.',
          preview: reason,
          link: '/doctor-verification',
          status: 'REJECTED',
          reason,
        }
      });
    } catch (notifError) {
      console.error('Failed to create verification rejection notification:', notifError);
    }

    // Send notification/email to doctor with rejection reason
    try {
      await emailService.sendVerificationRejectedEmail(updatedUser.email, updatedUser.username, reason);
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }

    return {
      message: 'Doctor verification rejected',
      user: updatedUser,
    };
  }

  /**
   * Suspend verified doctor (Admin only)
   */
  async suspendDoctor(userId: string, adminId: string, reason: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role !== 'DOCTOR') {
      throw new ValidationError('User is not a doctor');
    }

    if (user.doctorVerificationStatus !== 'APPROVED') {
      throw new ValidationError('Doctor is not verified');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        doctorVerificationStatus: 'SUSPENDED',
        verified: false,
        isSuspended: true,
        verificationNotes: reason,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        doctorVerificationStatus: true,
        isSuspended: true,
      }
    });

    return {
      message: 'Doctor suspended successfully',
      user: updatedUser,
    };
  }

  /**
   * Get doctor verification statistics (Admin dashboard)
   */
  async getVerificationStats() {
    // Use a single query with groupBy to reduce database connections
    const statusCounts = await prisma.user.groupBy({
      by: ['doctorVerificationStatus'],
      where: {
        role: 'DOCTOR'
      },
      _count: {
        id: true
      }
    });

    // Count recent approvals separately
    const recentApprovals = await prisma.user.count({
      where: {
        role: 'DOCTOR',
        doctorVerificationStatus: 'APPROVED',
        verifiedAt: {
          not: null,
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    // Calculate totals from grouped results
    let totalDoctors = 0;
    let pendingVerifications = 0;
    let approvedDoctors = 0;
    let rejectedDoctors = 0;
    let suspendedDoctors = 0;

    statusCounts.forEach(group => {
      const count = group._count.id;
      totalDoctors += count;

      switch (group.doctorVerificationStatus) {
        case 'PENDING':
        case 'UNDER_REVIEW':
          pendingVerifications += count;
          break;
        case 'APPROVED':
          approvedDoctors += count;
          break;
        case 'REJECTED':
          rejectedDoctors += count;
          break;
        case 'SUSPENDED':
          suspendedDoctors += count;
          break;
      }
    });

    return {
      totalDoctors,
      pendingVerifications,
      approvedDoctors,
      rejectedDoctors,
      suspendedDoctors,
      recentApprovals,
      approvalRate: totalDoctors > 0 ? ((approvedDoctors / totalDoctors) * 100).toFixed(2) : 0,
    };
  }

  /**
   * Check if doctor can perform doctor-specific actions
   */
  async canDoctorAct(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        doctorVerificationStatus: true,
        isSuspended: true,
      }
    });

    if (!user) return false;
    if (user.role !== 'DOCTOR') return false;
    if (user.isSuspended) return false;
    if (user.doctorVerificationStatus !== 'APPROVED') return false;

    return true;
  }
}

export const doctorVerificationService = new DoctorVerificationService();

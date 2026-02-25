import { UserRole, DoctorVerificationStatus } from '@prisma/client';

export interface PrivacyAccessResult {
  hasAccess: boolean;
  isAuthor: boolean;
  isDoctor: boolean;
  shouldFilterReplies: boolean;
  reason?: string;
}

export interface PrivacyCheckUser {
  id: string;
  role: UserRole;
  doctorVerificationStatus?: DoctorVerificationStatus | null;
}

export interface PrivacyCheckPost {
  id: string;
  authorId: string;
  isPrivate: boolean;
}

/**
 * Check if a user has access to a private post
 * @param user - The user requesting access
 * @param post - The post being accessed
 * @returns PrivacyAccessResult with access decision and filtering flags
 */
export function checkPrivatePostAccess(
  user: PrivacyCheckUser | null | undefined,
  post: PrivacyCheckPost
): PrivacyAccessResult {
  // Public posts are accessible to everyone
  if (!post.isPrivate) {
    return {
      hasAccess: true,
      isAuthor: user?.id === post.authorId,
      isDoctor: user?.role === UserRole.DOCTOR,
      shouldFilterReplies: false,
      reason: 'Public post',
    };
  }

  // Private posts require authentication
  if (!user) {
    return {
      hasAccess: false,
      isAuthor: false,
      isDoctor: false,
      shouldFilterReplies: false,
      reason: 'Authentication required for private posts',
    };
  }

  // Check if user is the post author
  const isAuthor = user.id === post.authorId;
  if (isAuthor) {
    return {
      hasAccess: true,
      isAuthor: true,
      isDoctor: user.role === UserRole.DOCTOR,
      shouldFilterReplies: false, // Authors see all replies
      reason: 'Post author',
    };
  }

  // Check if user is an approved doctor
  const isDoctor = user.role === UserRole.DOCTOR;
  const isApprovedDoctor =
    isDoctor && user.doctorVerificationStatus === DoctorVerificationStatus.APPROVED;

  if (isApprovedDoctor) {
    return {
      hasAccess: true,
      isAuthor: false,
      isDoctor: true,
      shouldFilterReplies: true, // Doctors only see their own replies
      reason: 'Approved doctor',
    };
  }

  // Access denied for non-doctors and unapproved doctors
  return {
    hasAccess: false,
    isAuthor: false,
    isDoctor: isDoctor,
    shouldFilterReplies: false,
    reason: isDoctor
      ? 'Doctor verification required for private posts'
      : 'Only doctors can access private posts',
  };
}

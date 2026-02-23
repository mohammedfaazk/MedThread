import { analytics } from './analytics';

/**
 * Track user registration conversion
 */
export const trackRegistration = (userId: string, userType: 'patient' | 'doctor') => {
  analytics.trackConversion('user_registration', 1, {
    userId,
    userType,
  });
};

/**
 * Track post creation conversion
 */
export const trackPostCreation = (postId: string, category: string) => {
  analytics.trackConversion('post_created', 1, {
    postId,
    category,
  });
};

/**
 * Track comment creation conversion
 */
export const trackCommentCreation = (commentId: string, postId: string) => {
  analytics.trackConversion('comment_created', 1, {
    commentId,
    postId,
  });
};

/**
 * Track appointment booking conversion
 */
export const trackAppointmentBooking = (appointmentId: string, doctorId: string) => {
  analytics.trackConversion('appointment_booked', 1, {
    appointmentId,
    doctorId,
  });
};

/**
 * Track doctor verification conversion
 */
export const trackDoctorVerification = (doctorId: string) => {
  analytics.trackConversion('doctor_verified', 1, {
    doctorId,
  });
};

/**
 * Track profile completion conversion
 */
export const trackProfileCompletion = (userId: string, completionPercentage: number) => {
  analytics.trackConversion('profile_completed', completionPercentage / 100, {
    userId,
    completionPercentage,
  });
};

/**
 * Track search conversion
 */
export const trackSearchPerformed = (query: string, resultsCount: number) => {
  analytics.trackConversion('search_performed', 1, {
    query,
    resultsCount,
  });
};

/**
 * Track file upload conversion
 */
export const trackFileUpload = (fileType: string, fileSize: number) => {
  analytics.trackConversion('file_uploaded', 1, {
    fileType,
    fileSize,
  });
};

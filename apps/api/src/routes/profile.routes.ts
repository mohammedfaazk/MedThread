import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { profileController } from '../controllers/profile.controller';
import { asyncHandler } from '../middleware/asyncHandler';

export const profileRouter = Router();

// Public routes (specific paths first, before /:username wildcard)
profileRouter.get(
  '/check-username',
  asyncHandler(profileController.checkUsernameAvailability.bind(profileController))
);

// Protected /me routes — MUST come before /:username wildcard
profileRouter.get(
  '/me/profile',
  authenticate,
  asyncHandler(profileController.getCurrentProfile.bind(profileController))
);

profileRouter.get(
  '/me/stats',
  authenticate,
  asyncHandler(profileController.getPatientStats.bind(profileController))
);

profileRouter.put(
  '/me/profile',
  authenticate,
  asyncHandler(profileController.updateProfile.bind(profileController))
);

profileRouter.put(
  '/me/avatar',
  authenticate,
  asyncHandler(profileController.uploadAvatar.bind(profileController))
);

profileRouter.put(
  '/me/banner',
  authenticate,
  asyncHandler(profileController.uploadBanner.bind(profileController))
);

profileRouter.put(
  '/me/password',
  authenticate,
  asyncHandler(profileController.changePassword.bind(profileController))
);

// 2FA routes
profileRouter.post(
  '/me/2fa/setup',
  authenticate,
  asyncHandler(profileController.setup2FA.bind(profileController))
);

profileRouter.post(
  '/me/2fa/enable',
  authenticate,
  asyncHandler(profileController.enable2FA.bind(profileController))
);

profileRouter.post(
  '/me/2fa/disable',
  authenticate,
  asyncHandler(profileController.disable2FA.bind(profileController))
);

// Public wildcard routes — MUST come after all /me/* routes
profileRouter.get(
  '/:username',
  asyncHandler(profileController.getProfileByUsername.bind(profileController))
);

profileRouter.get(
  '/:username/posts',
  asyncHandler(profileController.getUserPosts.bind(profileController))
);

profileRouter.get(
  '/:username/comments',
  asyncHandler(profileController.getUserComments.bind(profileController))
);

export default profileRouter;

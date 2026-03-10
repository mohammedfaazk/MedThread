"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const profile_controller_1 = require("../controllers/profile.controller");
const asyncHandler_1 = require("../middleware/asyncHandler");
exports.profileRouter = (0, express_1.Router)();
// Public routes
exports.profileRouter.get('/check-username', (0, asyncHandler_1.asyncHandler)(profile_controller_1.profileController.checkUsernameAvailability.bind(profile_controller_1.profileController)));
exports.profileRouter.get('/:username', (0, asyncHandler_1.asyncHandler)(profile_controller_1.profileController.getProfileByUsername.bind(profile_controller_1.profileController)));
exports.profileRouter.get('/:username/posts', (0, asyncHandler_1.asyncHandler)(profile_controller_1.profileController.getUserPosts.bind(profile_controller_1.profileController)));
exports.profileRouter.get('/:username/comments', (0, asyncHandler_1.asyncHandler)(profile_controller_1.profileController.getUserComments.bind(profile_controller_1.profileController)));
// Protected routes
exports.profileRouter.get('/me/profile', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(profile_controller_1.profileController.getCurrentProfile.bind(profile_controller_1.profileController)));
exports.profileRouter.get('/me/stats', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(profile_controller_1.profileController.getUserStats.bind(profile_controller_1.profileController)));
exports.profileRouter.put('/me/profile', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(profile_controller_1.profileController.updateProfile.bind(profile_controller_1.profileController)));
exports.profileRouter.put('/me/avatar', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(profile_controller_1.profileController.uploadAvatar.bind(profile_controller_1.profileController)));
exports.profileRouter.put('/me/banner', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(profile_controller_1.profileController.uploadBanner.bind(profile_controller_1.profileController)));
exports.profileRouter.put('/me/password', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(profile_controller_1.profileController.changePassword.bind(profile_controller_1.profileController)));
// 2FA routes
exports.profileRouter.post('/me/2fa/setup', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(profile_controller_1.profileController.setup2FA.bind(profile_controller_1.profileController)));
exports.profileRouter.post('/me/2fa/enable', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(profile_controller_1.profileController.enable2FA.bind(profile_controller_1.profileController)));
exports.profileRouter.post('/me/2fa/disable', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(profile_controller_1.profileController.disable2FA.bind(profile_controller_1.profileController)));
exports.default = exports.profileRouter;

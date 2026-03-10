"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportRouter = void 0;
const express_1 = require("express");
const auth_refactored_1 = require("../middleware/auth.refactored");
const report_controller_1 = require("../controllers/report.controller");
const router = (0, express_1.Router)();
exports.reportRouter = router;
// All report routes require authentication
router.use(auth_refactored_1.authenticate);
// Create reports
router.post('/post/:postId', report_controller_1.reportController.reportPost);
router.post('/comment/:commentId', report_controller_1.reportController.reportComment);
router.post('/user/:userId', report_controller_1.reportController.reportUser);
// Get user's own reports
router.get('/my-reports', report_controller_1.reportController.getMyReports);

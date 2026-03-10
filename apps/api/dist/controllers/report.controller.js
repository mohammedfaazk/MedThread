"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = exports.ReportController = void 0;
const report_service_1 = require("../services/report.service");
const asyncHandler_1 = require("../middleware/asyncHandler");
class ReportController {
    constructor() {
        // Report a post
        this.reportPost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { postId } = req.params;
            const { reason, details } = req.body;
            const userId = req.userId;
            const report = await report_service_1.reportService.reportPost(userId, postId, reason, details);
            res.status(201).json({
                success: true,
                data: report,
                message: 'Post reported successfully',
            });
        });
        // Report a comment
        this.reportComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { commentId } = req.params;
            const { reason, details } = req.body;
            const userId = req.userId;
            const report = await report_service_1.reportService.reportComment(userId, commentId, reason, details);
            res.status(201).json({
                success: true,
                data: report,
                message: 'Comment reported successfully',
            });
        });
        // Report a user
        this.reportUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { userId: reportedUserId } = req.params;
            const { reason, details } = req.body;
            const userId = req.userId;
            const report = await report_service_1.reportService.reportUser(userId, reportedUserId, reason, details);
            res.status(201).json({
                success: true,
                data: report,
                message: 'User reported successfully',
            });
        });
        // Get user's own reports
        this.getMyReports = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.userId;
            const { page, limit } = req.query;
            const reports = await report_service_1.reportService.getUserReports(userId, {
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
            });
            res.json({
                success: true,
                data: reports,
            });
        });
    }
}
exports.ReportController = ReportController;
exports.reportController = new ReportController();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.threadRouter = void 0;
const express_1 = require("express");
const database_1 = require("@medthread/database");
const zod_1 = require("zod");
const ai_symptom_analysis_service_1 = require("../services/ai-symptom-analysis.service");
exports.threadRouter = (0, express_1.Router)();
const createThreadSchema = zod_1.z.object({
    patientId: zod_1.z.string(),
    title: zod_1.z.string(),
    symptoms: zod_1.z.object({
        age: zod_1.z.number().optional(),
        gender: zod_1.z.string().optional(),
        weight: zod_1.z.number().optional(),
        existingConditions: zod_1.z.array(zod_1.z.string()),
        medications: zod_1.z.array(zod_1.z.string()),
        primarySymptoms: zod_1.z.array(zod_1.z.string()),
        duration: zod_1.z.string(),
        severity: zod_1.z.enum(['LOW', 'MODERATE', 'HIGH', 'EMERGENCY']),
        description: zod_1.z.string()
    }),
    tags: zod_1.z.array(zod_1.z.string())
});
exports.threadRouter.post('/', async (req, res) => {
    try {
        const data = createThreadSchema.parse(req.body);
        const thread = await database_1.prisma.medicalThread.create({
            data: {
                patientId: data.patientId,
                title: data.title,
                symptoms: data.symptoms,
                severityScore: data.symptoms.severity,
                tags: data.tags
            }
        });
        res.json(thread);
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid request' });
    }
});
exports.threadRouter.get('/', async (req, res) => {
    const threads = await database_1.prisma.medicalThread.findMany({
        include: {
            patient: { select: { username: true, role: true } },
            replies: { take: 3, orderBy: { createdAt: 'desc' } }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
    });
    res.json(threads);
});
exports.threadRouter.get('/:id', async (req, res) => {
    const thread = await database_1.prisma.medicalThread.findUnique({
        where: { id: req.params.id },
        include: {
            patient: { select: { username: true, role: true } },
            replies: {
                include: {
                    author: { select: { username: true, role: true } },
                    childReplies: true
                }
            },
            timeline: { orderBy: { timestamp: 'asc' } }
        }
    });
    if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
    }
    res.json(thread);
});
// Mark thread as resolved
exports.threadRouter.patch('/:id/resolve', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, bestAnswerId } = req.body;
        const thread = await database_1.prisma.medicalThread.findUnique({
            where: { id }
        });
        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }
        if (thread.patientId !== userId) {
            return res.status(403).json({ error: 'Only the thread author can mark it as resolved' });
        }
        const updatedThread = await database_1.prisma.medicalThread.update({
            where: { id },
            data: {
                isResolved: true,
                status: 'RESOLVED',
                resolvedAt: new Date()
            }
        });
        // Mark best answer if provided
        if (bestAnswerId) {
            await database_1.prisma.threadReply.update({
                where: { id: bestAnswerId },
                data: { isHelpful: true }
            });
        }
        // Create timeline event
        await database_1.prisma.caseTimelineEvent.create({
            data: {
                threadId: id,
                eventType: 'RESOLVED',
                description: 'Thread marked as resolved',
                metadata: { bestAnswerId }
            }
        });
        res.json(updatedThread);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to resolve thread' });
    }
});
// Update thread status
exports.threadRouter.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, userId } = req.body;
        const thread = await database_1.prisma.medicalThread.findUnique({
            where: { id }
        });
        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }
        if (thread.patientId !== userId) {
            return res.status(403).json({ error: 'Only the thread author can update status' });
        }
        const updatedThread = await database_1.prisma.medicalThread.update({
            where: { id },
            data: { status }
        });
        // Create timeline event
        await database_1.prisma.caseTimelineEvent.create({
            data: {
                threadId: id,
                eventType: 'STATUS_CHANGED',
                description: `Status changed to ${status}`,
                metadata: { newStatus: status }
            }
        });
        res.json(updatedThread);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});
// Get thread analytics
exports.threadRouter.get('/:id/analytics', async (req, res) => {
    try {
        const { id } = req.params;
        const thread = await database_1.prisma.medicalThread.findUnique({
            where: { id },
            include: {
                replies: {
                    include: {
                        author: { select: { role: true, doctorVerificationStatus: true } }
                    }
                }
            }
        });
        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }
        const analytics = {
            totalReplies: thread.replies.length,
            doctorReplies: thread.replies.filter(r => r.author.role === 'DOCTOR' && r.author.doctorVerificationStatus === 'APPROVED').length,
            averageResponseTime: 0, // Calculate based on timestamps
            helpfulReplies: thread.replies.filter(r => r.isHelpful).length,
            totalUpvotes: thread.replies.reduce((sum, r) => sum + r.upvotes, 0),
            isResolved: thread.isResolved,
            status: thread.status
        };
        res.json(analytics);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});
// Get AI symptom analysis for thread
exports.threadRouter.get('/:id/ai-analysis', async (req, res) => {
    try {
        const { id } = req.params;
        const thread = await database_1.prisma.medicalThread.findUnique({
            where: { id }
        });
        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }
        // Return cached analysis if exists
        if (thread.aiAnalysis) {
            return res.json(thread.aiAnalysis);
        }
        // Generate new analysis
        const analysis = await ai_symptom_analysis_service_1.aiSymptomAnalysisService.analyzeThread(id);
        res.json(analysis);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate AI analysis' });
    }
});
// Symptom checker endpoint
exports.threadRouter.post('/symptom-checker', async (req, res) => {
    try {
        const symptoms = req.body;
        const analysis = await ai_symptom_analysis_service_1.aiSymptomAnalysisService.analyzeSymptoms({ symptoms });
        res.json(analysis);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to analyze symptoms' });
    }
});
exports.default = exports.threadRouter;

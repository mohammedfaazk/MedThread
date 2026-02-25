"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.threadRouter = void 0;
const express_1 = require("express");
const database_1 = require("@medthread/database");
const zod_1 = require("zod");
const pagination_1 = require("../utils/pagination");
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
    try {
        const { page, limit, sortBy, sortOrder } = (0, pagination_1.getPaginationParams)(req.query);
        const { skip, take } = (0, pagination_1.getSkipTake)(page, limit);
        const [threads, total] = await Promise.all([
            database_1.prisma.medicalThread.findMany({
                include: {
                    patient: { select: { username: true, role: true, avatar: true } },
                    replies: { take: 3, orderBy: { createdAt: 'desc' } }
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take,
            }),
            database_1.prisma.medicalThread.count()
        ]);
        const response = (0, pagination_1.createPaginatedResponse)(threads, total, page, limit);
        res.json(response);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch threads' });
    }
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
exports.default = exports.threadRouter;

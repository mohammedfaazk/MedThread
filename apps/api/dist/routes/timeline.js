"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timelineRouter = void 0;
const express_1 = require("express");
const database_1 = require("@medthread/database");
const auth_1 = require("../middleware/auth");
exports.timelineRouter = (0, express_1.Router)();
exports.timelineRouter.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { threadId, eventType, data } = req.body;
        const event = await database_1.prisma.caseTimelineEvent.create({
            data: {
                threadId,
                userId: req.userId,
                eventType,
                data
            }
        });
        res.json(event);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create timeline event' });
    }
});
exports.timelineRouter.get('/:threadId', async (req, res) => {
    const events = await database_1.prisma.caseTimelineEvent.findMany({
        where: { threadId: req.params.threadId },
        orderBy: { timestamp: 'asc' },
        include: {
            user: { select: { username: true, role: true } }
        }
    });
    res.json(events);
});
exports.default = exports.timelineRouter;

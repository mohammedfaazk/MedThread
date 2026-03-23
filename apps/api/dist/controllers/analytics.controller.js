"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSymptomHeatmap = getSymptomHeatmap;
exports.getTrendsSeries = getTrendsSeries;
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prisma = new client_1.PrismaClient();
async function getSymptomHeatmap(req, res) {
    try {
        const { region_type = 'state', symptom, date_from, days, state } = req.query;
        const dateFrom = date_from
            ? new Date(date_from)
            : (0, date_fns_1.subDays)(new Date(), Number(days || 30));
        const where = {
            regionType: region_type,
            reportDate: { gte: dateFrom, lte: new Date() }
        };
        if (symptom)
            where.symptomTag = symptom;
        if (state)
            where.regionName = state;
        const rows = await prisma.symptomHeatmapStat.groupBy({
            by: ['regionName', 'symptomTag', 'alertLevel'],
            where,
            _sum: { caseCount: true },
            _avg: { severityAvg: true },
            orderBy: { _sum: { caseCount: 'desc' } }
        });
        const data = rows.map(r => ({
            regionName: r.regionName,
            symptomTag: r.symptomTag,
            caseCount: r._sum.caseCount ?? 0,
            severityAvg: r._avg.severityAvg ?? 0,
            alertLevel: r.alertLevel,
        }));
        res.json({ success: true, data });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch heatmap data' });
    }
}
async function getTrendsSeries(req, res) {
    try {
        const { region_type = 'state', region_name, days = '30' } = req.query;
        const rows = await prisma.symptomHeatmapStat.groupBy({
            by: ['reportDate', 'symptomTag'],
            where: {
                regionType: region_type,
                ...(region_name ? { regionName: region_name } : {}),
                reportDate: { gte: (0, date_fns_1.subDays)(new Date(), Number(days)) }
            },
            _sum: { caseCount: true },
            orderBy: { reportDate: 'asc' }
        });
        res.json({ success: true, data: rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch trends series' });
    }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runHeatmapAggregation = runHeatmapAggregation;
const client_1 = require("@prisma/client");
const symptomExtractor_service_1 = require("./symptomExtractor.service");
const date_fns_1 = require("date-fns");
const prisma = new client_1.PrismaClient();
async function runHeatmapAggregation() {
    console.log('[HeatmapCron] Starting aggregation...');
    const today = (0, date_fns_1.startOfDay)(new Date());
    const since = (0, date_fns_1.subDays)(today, 1);
    const posts = await prisma.post.findMany({
        where: { createdAt: { gte: since, lt: today } },
        include: {
            author: { select: { state: true, city: true, district: true, pincode: true } }
        }
    });
    const appointments = await prisma.appointment.findMany({
        where: { createdAt: { gte: since, lt: today } },
        include: {
            patient: { select: { state: true, city: true, district: true, pincode: true } }
        }
    });
    const statMap = new Map();
    function record(regionType, regionName, symptom, severity) {
        if (!regionName)
            return;
        const key = `${regionType}::${regionName}::${symptom}`;
        const cur = statMap.get(key) || { count: 0, severities: [] };
        cur.count += 1;
        cur.severities.push(severity);
        statMap.set(key, cur);
    }
    for (const post of posts) {
        const symptoms = (0, symptomExtractor_service_1.extractSymptoms)(post.content || '');
        const severity = (0, symptomExtractor_service_1.extractSeverity)(post.content || '');
        const { state, city, district, pincode } = post.author;
        for (const sym of symptoms) {
            record('state', state, sym, severity);
            record('city', city, sym, severity);
            record('district', district, sym, severity);
            record('pincode', pincode, sym, severity);
        }
    }
    for (const appt of appointments) {
        const text = [appt.chiefComplaint, appt.notes, appt.diagnosisTag].filter(Boolean).join(' ');
        const symptoms = (0, symptomExtractor_service_1.extractSymptoms)(text);
        const severity = (0, symptomExtractor_service_1.extractSeverity)(text);
        const { state, city, district, pincode } = appt.patient;
        for (const sym of symptoms) {
            record('state', state, sym, severity);
            record('city', city, sym, severity);
            record('district', district, sym, severity);
            record('pincode', pincode, sym, severity);
        }
    }
    const fourWeeksAgo = (0, date_fns_1.subWeeks)(today, 4);
    for (const [key, val] of statMap.entries()) {
        const [regionType, regionName, symptomTag] = key.split('::');
        const severityAvg = val.severities.reduce((a, b) => a + b, 0) / val.severities.length;
        const historical = await prisma.symptomHeatmapStat.aggregate({
            where: {
                regionType, regionName, symptomTag,
                reportDate: { gte: fourWeeksAgo, lt: (0, date_fns_1.subDays)(today, 7) }
            },
            _avg: { caseCount: true }
        });
        const avgLast4Weeks = historical._avg.caseCount || 1;
        const spikeRatio = val.count / avgLast4Weeks;
        const alertLevel = spikeRatio >= 4.0 ? 'outbreak' :
            spikeRatio >= 2.5 ? 'epidemic' :
                spikeRatio >= 1.5 ? 'watch' : 'none';
        await prisma.symptomHeatmapStat.upsert({
            where: {
                regionType_regionName_symptomTag_reportDate: {
                    regionType, regionName, symptomTag, reportDate: today
                }
            },
            update: { caseCount: val.count, severityAvg, spikeRatio, alertLevel },
            create: {
                regionType, regionName, symptomTag,
                caseCount: val.count, severityAvg, spikeRatio, alertLevel,
                source: 'post+appointment', reportDate: today
            }
        });
    }
    console.log(`[HeatmapCron] Done. ${statMap.size} stat records written.`);
}

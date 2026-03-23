import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { subDays } from 'date-fns';

const prisma = new PrismaClient();

export async function getSymptomHeatmap(req: Request, res: Response) {
  try {
    const { region_type = 'state', symptom, date_from, days, state } = req.query;

    const dateFrom = date_from
      ? new Date(date_from as string)
      : subDays(new Date(), Number(days || 30));

    const where: any = {
      regionType: region_type as string,
      reportDate: { gte: dateFrom, lte: new Date() }
    };

    if (symptom) where.symptomTag = symptom as string;
    if (state)   where.regionName = state as string;

    const rows = await prisma.symptomHeatmapStat.groupBy({
      by: ['regionName', 'symptomTag', 'alertLevel'],
      where,
      _sum: { caseCount: true },
      _avg: { severityAvg: true },
      orderBy: { _sum: { caseCount: 'desc' } }
    });

    const data = rows.map(r => ({
      regionName:  r.regionName,
      symptomTag:  r.symptomTag,
      caseCount:   r._sum.caseCount   ?? 0,
      severityAvg: r._avg.severityAvg ?? 0,
      alertLevel:  r.alertLevel,
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('[Analytics] Error in getSymptomHeatmap:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch heatmap data' });
  }
}

export async function getRegionData(req: Request, res: Response) {
  try {
    const { region_type = 'state' } = req.query;
    
    // Get unique regions for the specified type
    const regions = await prisma.symptomHeatmapStat.groupBy({
      by: ['regionName'],
      where: {
        regionType: region_type as string,
        regionName: { not: null }
      },
      _count: { regionName: true }
    });

    const data = regions.map(r => ({
      name: r.regionName,
      count: r._count.regionName
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('[Analytics] Error in getRegionData:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch region data' });
  }
}

export async function getTest(req: Request, res: Response) {
  console.log('[Analytics] Test endpoint called');
  res.json({ success: true, message: 'Analytics API is working!', timestamp: new Date().toISOString() });
}

export async function getTrendsSeries(req: Request, res: Response) {
  try {
    const { region_type = 'state', region_name, days = '30' } = req.query;

    const rows = await prisma.symptomHeatmapStat.groupBy({
      by: ['reportDate', 'symptomTag'],
      where: {
        regionType: region_type as string,
        ...(region_name ? { regionName: region_name as string } : {}),
        reportDate: { gte: subDays(new Date(), Number(days)) }
      },
      _sum: { caseCount: true },
      orderBy: { reportDate: 'asc' }
    });

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch trends series' });
  }
}
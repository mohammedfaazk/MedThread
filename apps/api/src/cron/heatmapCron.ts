import * as cron from 'node-cron';
import { runHeatmapAggregation } from '../services/heatmapAggregator.service';

export function startHeatmapCron() {
  cron.schedule('0 2 * * *', async () => {
    try {
      await runHeatmapAggregation();
    } catch (err) {
      console.error('[HeatmapCron] Failed:', err);
    }
  });
  console.log('[HeatmapCron] Scheduled — runs daily at 2AM');
}
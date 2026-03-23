import { runHeatmapAggregation } from './src/services/heatmapAggregator.service';

runHeatmapAggregation()
  .then(() => {
    console.log('✅ Heatmap aggregation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Heatmap aggregation failed:', error);
    process.exit(1);
  });
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startHeatmapCron = startHeatmapCron;
const node_cron_1 = __importDefault(require("node-cron"));
const heatmapAggregator_service_1 = require("../services/heatmapAggregator.service");
function startHeatmapCron() {
    node_cron_1.default.schedule('0 2 * * *', async () => {
        try {
            await (0, heatmapAggregator_service_1.runHeatmapAggregation)();
        }
        catch (err) {
            console.error('[HeatmapCron] Failed:', err);
        }
    });
    console.log('[HeatmapCron] Scheduled — runs daily at 2AM');
}

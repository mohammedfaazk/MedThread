"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post('/api/analyze-symptoms', async (req, res) => {
    const { symptoms, description, severity } = req.body;
    const analysis = {
        possibleConditions: [
            'Common Cold',
            'Influenza',
            'Viral Infection'
        ],
        emergencyWarning: severity === 'EMERGENCY',
        suggestedQuestions: [
            'Do you have a sore throat?',
            'Have you been in contact with sick individuals?'
        ],
        similarCases: ['case_123', 'case_456', 'case_789'],
        riskScore: severity === 'HIGH' || severity === 'EMERGENCY' ? 8 : 4
    };
    res.json(analysis);
});
// Emergency detection endpoint
app.post('/api/detect-emergency', async (req, res) => {
    const { symptoms } = req.body;
    const emergencyKeywords = [
        'chest pain',
        'difficulty breathing',
        'severe bleeding',
        'stroke',
        'heart attack'
    ];
    const isEmergency = symptoms.some((symptom) => emergencyKeywords.some(keyword => symptom.toLowerCase().includes(keyword)));
    res.json({ isEmergency, confidence: isEmergency ? 0.95 : 0.1 });
});
app.listen(PORT, () => {
    console.log(`🤖 AI Service running on port ${PORT}`);
});
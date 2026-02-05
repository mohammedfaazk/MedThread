import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Symptom analysis endpoint
app.post('/api/analyze-symptoms', async (req, res) => {
  const { symptoms, description, severity } = req.body;
  
  // Mock AI analysis
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
  
  const isEmergency = symptoms.some((symptom: string) =>
    emergencyKeywords.some(keyword =>
      symptom.toLowerCase().includes(keyword)
    )
  );
  
  res.json({ isEmergency, confidence: isEmergency ? 0.95 : 0.1 });
});

app.listen(PORT, () => {
  console.log(`🤖 AI Service running on port ${PORT}`);
});

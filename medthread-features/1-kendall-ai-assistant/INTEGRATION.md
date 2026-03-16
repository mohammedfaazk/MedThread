# Kendall AI Assistant - Integration Guide

## Step 1: Install Dependencies

```bash
npm install axios
```

## Step 2: Set Environment Variables

Create or update your `.env` file:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

## Step 3: Copy Files to Your Project

```
your-project/
├── src/
│   ├── features/
│   │   └── kendall-ai-assistant/
│   │       ├── components/
│   │       │   ├── Chat.tsx
│   │       │   └── OfflineBanner.tsx
│   │       ├── services/
│   │       │   ├── aiService.ts
│   │       │   ├── speechService.ts
│   │       │   ├── languageService.ts
│   │       │   ├── emergencyDetector.ts
│   │       │   └── symptomEngine.ts
│   │       ├── config/
│   │       │   └── constants.ts
│   │       ├── hooks/
│   │       │   └── useTranslation.ts
│   │       ├── context/
│   │       │   └── AppContext.tsx
│   │       ├── types/
│   │       │   └── health.ts
│   │       └── utils/
│   │           └── debugApi.ts
```

## Step 4: Update Import Paths

In all copied files, update import paths from:
```typescript
import { something } from '@/services/...'
```

To:
```typescript
import { something } from '../services/...'
// or
import { something } from '@/features/kendall-ai-assistant/services/...'
```

## Step 5: Wrap Your App with AppProvider

```tsx
// src/App.tsx or src/main.tsx
import { AppProvider } from './features/kendall-ai-assistant/context/AppContext';

function App() {
  return (
    <AppProvider>
      {/* Your app routes */}
    </AppProvider>
  );
}
```

## Step 6: Add Chat Route

```tsx
import { Chat } from './features/kendall-ai-assistant/components/Chat';

<Routes>
  <Route path="/chat" element={<Chat />} />
  {/* Other routes */}
</Routes>
```

## Step 7: Optional - Add Offline Banner

```tsx
import { OfflineBanner } from './features/kendall-ai-assistant/components/OfflineBanner';

function App() {
  return (
    <AppProvider>
      <OfflineBanner />
      {/* Your app */}
    </AppProvider>
  );
}
```

## Usage Examples

### Basic Chat Integration

```tsx
import { Chat } from '@/features/kendall-ai-assistant/components/Chat';

export function HealthAssistantPage() {
  return <Chat />;
}
```

### Using Services Directly

```tsx
import { aiService } from '@/features/kendall-ai-assistant/services/aiService';
import { speechService } from '@/features/kendall-ai-assistant/services/speechService';

// Check if AI is available
const isAvailable = aiService.isAvailable();

// Send a message
const response = await aiService.chat('I have a headache');

// Use speech
speechService.speak('Hello, how can I help you?', {
  language: 'en',
  rate: 1.0
});
```

### Emergency Detection

```tsx
import { emergencyDetector } from '@/features/kendall-ai-assistant/services/emergencyDetector';

const result = emergencyDetector.detectEmergency(
  symptoms,
  userInput,
  'en'
);

if (result.isEmergency) {
  // Navigate to emergency page
  navigate('/emergency');
}
```

## Customization

### Add New Languages

Edit `config/constants.ts`:

```typescript
export const SUPPORTED_LANGUAGES = {
  // ... existing languages
  fr: { name: 'French', nativeName: 'Français', code: 'fr-FR' },
};

export const EMERGENCY_KEYWORDS = {
  // ... existing keywords
  fr: ['douleur thoracique', 'difficulté respiratoire'],
};
```

### Customize AI Prompts

Edit `services/aiService.ts` in the `buildSystemPrompt` method:

```typescript
private buildSystemPrompt(patientInfo?: PatientInfo): string {
  return `You are Kendall, a compassionate healthcare assistant...
  
  YOUR CUSTOM INSTRUCTIONS HERE
  `;
}
```

### Add Disease Patterns

Edit `config/constants.ts`:

```typescript
export const COMMON_DISEASES = {
  // ... existing diseases
  YOUR_DISEASE: {
    name: 'Disease Name',
    symptoms: ['symptom1', 'symptom2'],
    duration: '3-7 days',
    severity: 'MEDIUM',
  },
};
```

## Troubleshooting

### API Key Not Working

1. Check `.env` file has `VITE_GEMINI_API_KEY`
2. Restart dev server after adding env variables
3. Run debug utility:
```typescript
import { debugGeminiAPI } from '@/features/kendall-ai-assistant/utils/debugApi';
await debugGeminiAPI();
```

### Speech Not Working

1. Check browser permissions for microphone
2. Use HTTPS (required for Web Speech API)
3. Check browser compatibility:
```typescript
const isSupported = speechService.isSpeechRecognitionSupported();
```

### Offline Mode

The assistant automatically falls back to rule-based responses when:
- No internet connection
- API key not configured
- API request fails

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Limited speech synthesis
- Safari: iOS 14.5+ required for speech
- Mobile: Best on Chrome Android, Safari iOS

## Performance Tips

1. Conversation history is stored in memory - clear periodically:
```typescript
aiService.resetConversation();
```

2. Limit speech synthesis for long responses
3. Use rule-based mode for faster responses in poor network conditions

## Security Notes

- API key is exposed in client-side code (use backend proxy in production)
- User conversations are not stored on server
- Local storage used for language preferences only

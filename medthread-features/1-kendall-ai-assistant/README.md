# Kendall AI Assistant

Voice-first multilingual healthcare assistant with emergency detection and rule-based fallback logic.

## Features

- 🎤 Voice input/output with Web Speech API
- 🌍 Multilingual support (English, Tamil, Telugu, Hindi, Bengali, Kannada, Malayalam)
- 🚨 Emergency symptom detection with automatic routing
- 🤖 AI-powered responses using Google Gemini API
- 📱 Offline-capable with rule-based fallback
- 🔊 Auto-play responses with gender-specific voices
- 💬 Conversation history tracking

## Components

- `Chat.tsx` - Main chat interface with voice controls
- `OfflineBanner.tsx` - Online/offline status indicator

## Services

- `aiService.ts` - AI conversation engine (Gemini API + rule-based)
- `speechService.ts` - Speech-to-text and text-to-speech
- `languageService.ts` - Language detection and translation
- `emergencyDetector.ts` - Emergency keyword and symptom detection
- `symptomEngine.ts` - Rule-based symptom analysis

## Dependencies

```bash
npm install axios
```

## Environment Variables

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## Integration Example

```tsx
import { Chat } from './kendall-ai-assistant/components/Chat';
import { AppProvider } from './kendall-ai-assistant/context/AppContext';

function App() {
  return (
    <AppProvider>
      <Chat />
    </AppProvider>
  );
}
```

## Configuration

Edit `config/constants.ts` to customize:
- Supported languages
- Emergency keywords
- Severity thresholds
- Common diseases database

## API Keys

Get your Gemini API key from: https://makersuite.google.com/app/apikey

## Offline Mode

The assistant works offline using:
- Rule-based symptom matching
- Pre-defined disease patterns
- Template-based responses
- Local storage for conversation history

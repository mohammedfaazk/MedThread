# VitaVoice Features for Medthread Integration

This package contains three standalone features extracted from VitaVoice for integration into Medthread:

## 1. Kendall AI Assistant (`/kendall-ai-assistant`)
Voice-first multilingual healthcare assistant with emergency detection

## 2. Emergency Services (`/emergency-services`)
Emergency page with hospital locator, GPS navigation, and first aid guide

## 3. Calorie Diet Planner (`/calorie-diet-planner`)
Personalized diet plan generator with meal suggestions

## Integration Guide

Each feature folder contains:
- `components/` - React components
- `services/` - Business logic and API services
- `types/` - TypeScript type definitions
- `config/` - Configuration and constants
- `hooks/` - Custom React hooks
- `utils/` - Utility functions
- `README.md` - Feature-specific integration guide

## Dependencies

All features require:
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^7.12.0",
  "motion": "^12.23.24",
  "lucide-react": "^0.487.0"
}
```

See individual feature READMEs for additional dependencies.

## Environment Variables

```env
# For Kendall AI Assistant
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## Quick Start

1. Copy the desired feature folder(s) into your Medthread project
2. Install dependencies listed in each feature's README
3. Import and integrate components as shown in the examples
4. Configure environment variables if needed

## Support

For questions or issues, refer to the original VitaVoice documentation.

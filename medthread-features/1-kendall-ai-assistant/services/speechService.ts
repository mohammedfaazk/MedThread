// Speech-to-Text and Text-to-Speech service using Web Speech API

import { languageService, type LanguageCode } from './languageService';
import { SUPPORTED_LANGUAGES } from '@/config/constants';

type SpeechCallback = (transcript: string, isFinal: boolean) => void;
type SpeechErrorCallback = (error: string) => void;

class SpeechService {
    private recognition: SpeechRecognition | null = null;
    private synthesis: SpeechSynthesis;
    private isListening = false;
    private currentUtterance: SpeechSynthesisUtterance | null = null;
    private preferredVoiceGender: 'male' | 'female' = 'female';
    private voiceSpeed: number = 1.0;

    // Known voice genders mapping for common voice names
    private voiceGenderMap: { [key: string]: 'male' | 'female' } = {
        // Microsoft voices
        'microsoft david': 'male',
        'microsoft mark': 'male',
        'microsoft ravi': 'male',
        'microsoft zira': 'female',
        'microsoft heera': 'female',
        // macOS/iOS voices
        'alex': 'male',
        'daniel': 'male',
        'karen': 'female',
        'moira': 'female',
        'rishi': 'male',
        'samantha': 'female',
        'victoria': 'female',
        'tom': 'male',
        // Android voices
        'en_US': 'female', // default Google US English is female
    };

    constructor() {
        // Initialize Speech Recognition
        const SpeechRecognitionAPI =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (SpeechRecognitionAPI) {
            this.recognition = new SpeechRecognitionAPI();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
        }

        // Initialize Speech Synthesis
        this.synthesis = window.speechSynthesis;

        // Load saved voice speed
        const savedVoiceSpeed = localStorage.getItem('vitavoice_voiceSpeed');
        if (savedVoiceSpeed) {
            this.voiceSpeed = parseFloat(savedVoiceSpeed);
        }
    }

    /**
     * Check if speech recognition is supported
     */
    isSpeechRecognitionSupported(): boolean {
        return this.recognition !== null;
    }

    /**
     * Check if speech synthesis is supported
     */
    isSpeechSynthesisSupported(): boolean {
        return 'speechSynthesis' in window;
    }

    /**
     * Start listening for speech input
     */
    startListening(
        onResult: SpeechCallback,
        onError?: SpeechErrorCallback,
        language?: LanguageCode
    ): void {
        if (!this.recognition) {
            onError?.('Speech recognition not supported in this browser');
            return;
        }

        // Always stop first to ensure clean state
        this.stopListening();

        const lang = language || languageService.getLanguage();
        const langCode = SUPPORTED_LANGUAGES[lang].code;

        this.recognition.lang = langCode;
        this.isListening = true;

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
            const last = event.results.length - 1;
            const result = event.results[last];
            const transcript = result[0].transcript;
            const isFinal = result.isFinal;

            onResult(transcript, isFinal);
        };

        this.recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            onError?.(event.error);
        };

        this.recognition.onend = () => {
            this.isListening = false;
        };

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting recognition:', error);
            this.isListening = false;
            onError?.('Failed to start speech recognition');
        }
    }

    /**
     * Stop listening
     */
    stopListening(): void {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
                this.isListening = false;
            } catch (error) {
                console.error('Error stopping recognition:', error);
                this.isListening = false;
            }
        }
    }

    /**
     * Check if currently listening
     */
    getIsListening(): boolean {
        return this.isListening;
    }

    /**
     * Set the speech rate and persist to localStorage
     */
    setRate(rate: number): void {
        this.voiceSpeed = rate;
        localStorage.setItem('vitavoice_voiceSpeed', rate.toString());
        if (this.currentUtterance) {
            this.currentUtterance.rate = rate;
        }
    }

    /**
     * Get the current voice speed
     */
    getRate(): number {
        return this.voiceSpeed;
    }

    /**
     * Set the preferred voice gender
     */
    setVoiceGender(gender: 'male' | 'female'): void {
        this.preferredVoiceGender = gender;
    }

    /**
     * Get the current voice gender preference
     */
    getVoiceGender(): 'male' | 'female' {
        return this.preferredVoiceGender;
    }

    /**
     * Speak text using text-to-speech
     */
    speak(
        text: string,
        options?: {
            language?: LanguageCode;
            rate?: number; // 0.1 to 10, default 1
            pitch?: number; // 0 to 2, default 1
            volume?: number; // 0 to 1, default 1
            gender?: 'male' | 'female'; // Voice gender preference
            onEnd?: () => void;
            onError?: (error: string) => void;
        }
    ): void {
        if (!this.isSpeechSynthesisSupported()) {
            options?.onError?.('Speech synthesis not supported');
            return;
        }

        // Cancel any ongoing speech
        this.stopSpeaking();

        const lang = options?.language || languageService.getLanguage();
        const langEntry = SUPPORTED_LANGUAGES[lang];

        if (!langEntry) {
            options?.onError?.(`Language "${lang}" not found in supported languages`);
            return;
        }

        const langCode = langEntry.code;

        this.currentUtterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance.lang = langCode;
        this.currentUtterance.rate = options?.rate || this.voiceSpeed; // Use saved voice speed as default
        this.currentUtterance.pitch = options?.pitch || 1;
        this.currentUtterance.volume = options?.volume || 1;

        // Try to find a voice for the language with preferred gender
        const voices = this.synthesis.getVoices();
        const gender = options?.gender || this.preferredVoiceGender;

        let voice: SpeechSynthesisVoice | undefined;

        // Find voice matching language and gender
        voice = voices.find(v => {
            if (!v.lang.startsWith(langCode)) return false;

            const voiceName = v.name.toLowerCase();

            // Check for explicit gender in name (Google voices)
            if (gender === 'male' && voiceName.includes('male')) return true;
            if (gender === 'female' && voiceName.includes('female')) return true;

            // Check against known voice database
            const knownGender = this.voiceGenderMap[voiceName];
            if (knownGender === gender) return true;

            // Check for common male/female patterns
            const malePatterns = ['male', 'man', 'boy', 'david', 'mark', 'ravi', 'alex', 'daniel', 'rishi', 'tom'];
            const femalePatterns = ['female', 'woman', 'girl', 'zira', 'heera', 'karen', 'moira', 'samantha', 'victoria'];

            if (gender === 'male') {
                return malePatterns.some(p => voiceName.includes(p));
            } else {
                return femalePatterns.some(p => voiceName.includes(p));
            }
        });

        // Fall back to any voice for the language if gender-specific not found
        if (!voice) {
            voice = voices.find(v => v.lang.startsWith(langCode));
        }

        // Fall back to English if nothing found
        if (!voice) {
            voice = voices.find(v => v.lang.startsWith('en'));
        }

        if (voice) {
            this.currentUtterance.voice = voice;
        }

        this.currentUtterance.onend = () => {
            options?.onEnd?.();
            this.currentUtterance = null;
        };

        this.currentUtterance.onerror = (event: any) => {
            // Ignore "interrupted" errors - they happen when speech is cancelled intentionally
            if (event.error !== 'interrupted') {
                console.error('Speech synthesis error:', event);
                options?.onError?.(event.error);
            }
            this.currentUtterance = null;
        };

        this.synthesis.speak(this.currentUtterance);
    }

    /**
     * Stop speaking
     */
    stopSpeaking(): void {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
            this.currentUtterance = null;
        }
    }

    /**
     * Check if currently speaking
     */
    isSpeaking(): boolean {
        return this.synthesis.speaking;
    }

    /**
     * Get available voices for a language and optional gender
     */
    getVoicesForLanguage(language: LanguageCode, gender?: 'male' | 'female'): SpeechSynthesisVoice[] {
        const voices = this.synthesis.getVoices();
        let filtered = voices.filter(v => v.lang.startsWith(language));

        if (gender) {
            const genderPatterns = {
                male: ['male', 'man', 'boy'],
                female: ['female', 'woman', 'girl']
            };

            const patterns = genderPatterns[gender];
            filtered = filtered.filter(v =>
                patterns.some(pattern => v.name.toLowerCase().includes(pattern))
            );
        }

        return filtered;
    }

    /**
     * Check if a language has available voices
     */
    hasVoicesForLanguage(language: string): boolean {
        const voices = this.synthesis.getVoices();
        return voices.some(v => v.lang.startsWith(language));
    }

    /**
     * Get all available languages with voices
     */
    getAvailableLanguages(): string[] {
        const voices = this.synthesis.getVoices();
        const langs = new Set<string>();
        voices.forEach(v => {
            const langCode = v.lang.split('-')[0]; // Get first part (e.g., 'ta' from 'ta-IN')
            langs.add(langCode);
        });
        return Array.from(langs).sort();
    }

    /**
     * Debug: Log all available voices
     */
    logAvailableVoices(): void {
        const voices = this.synthesis.getVoices();
        console.log('=== Available Voices ===');
        const grouped: { [key: string]: string[] } = {};
        voices.forEach(v => {
            const lang = v.lang.split('-')[0];
            if (!grouped[lang]) grouped[lang] = [];
            grouped[lang].push(`${v.name} (${v.lang})`);
        });
        Object.entries(grouped).forEach(([lang, names]) => {
            console.log(`${lang}: ${names.join(', ')}`);
        });
        console.log('=== Total voices:', voices.length);
    }

    /**
     * Pause speaking
     */
    pauseSpeaking(): void {
        if (this.synthesis.speaking && !this.synthesis.paused) {
            this.synthesis.pause();
        }
    }

    /**
     * Speak using Google Translate TTS API as fallback when native voices aren't available
     */
    async speakUsingGoogleTranslate(
        text: string,
        language: string = 'ta',
        options?: {
            rate?: number;
            onEnd?: () => void;
            onError?: (error: string) => void;
        }
    ): Promise<void> {
        try {
            // Use Google Translate TTS API
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${language}&client=tw-ob`;
            
            const audio = new Audio(url);
            
            audio.onended = () => {
                options?.onEnd?.();
            };
            
            audio.onerror = () => {
                options?.onError?.('Failed to play Tamil audio from Google Translate');
            };
            
            audio.play().catch(err => {
                options?.onError?.('Failed to play audio: ' + err.message);
            });
        } catch (error) {
            options?.onError?.('Error: ' + (error as Error).message);
        }
    }

    /**
     * Resume speaking
     */
    resumeSpeaking(): void {
        if (this.synthesis.paused) {
            this.synthesis.resume();
        }
    }
}

export const speechService = new SpeechService();

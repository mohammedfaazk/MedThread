import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { languageService } from '@/services/languageService';

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  conditions: string[];
  allergies: string[];
  photo?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  hasVoice?: boolean;
}

export interface HistoryEntry {
  id: string;
  date: Date;
  complaint: string;
  diagnosis: string;
  severity: 'low' | 'medium' | 'high';
  duration: string;
}

interface AppContextType {
  isOnline: boolean;
  selectedLanguage: string;
  selectedLanguageCode: string;
  setSelectedLanguage: (lang: string) => void;
  setSelectedLanguageCode: (code: string) => void;
  autoPlay: boolean;
  setAutoPlay: (value: boolean) => void;
  familyMembers: FamilyMember[];
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  chatHistory: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  medicalHistory: HistoryEntry[];
  addHistoryEntry: (entry: Omit<HistoryEntry, 'id' | 'date'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Initialize language code from storage with safety checks
  const [selectedLanguage, setSelectedLanguageState] = useState<string>(() => {
    const languageCode = languageService.getLanguage();
    const langInfo = languageService.getLanguageInfo(languageCode as any);
    return langInfo?.name || 'English';
  });
  
  const [selectedLanguageCode, setSelectedLanguageCodeState] = useState<string>(() => {
    return languageService.getLanguage();
  });
  const [autoPlay, setAutoPlay] = useState(() => {
    const saved = localStorage.getItem('vitavoice_autoplay');
    return saved ? JSON.parse(saved) : true;
  });
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('vitavoice_family');
    return saved ? JSON.parse(saved) : [];
  });
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<HistoryEntry[]>(() => {
    const saved = localStorage.getItem('vitavoice_history');
    return saved ? JSON.parse(saved) : [];
  });

  const setSelectedLanguage = (langName: string) => {
    setSelectedLanguageState(langName);
  };

  const setSelectedLanguageCode = (code: string) => {
    setSelectedLanguageCodeState(code);
    languageService.setLanguage(code as any);
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize voice gender from speechService
    const savedVoiceGender = localStorage.getItem('vitavoice_voiceGender') as 'male' | 'female' | 'neutral' | null;
    if (savedVoiceGender) {
      // Import speechService here to avoid circular dependency
      import('@/services/speechService').then(({ speechService }) => {
        speechService.setVoiceGender(savedVoiceGender);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('vitavoice_family', JSON.stringify(familyMembers));
  }, [familyMembers]);

  useEffect(() => {
    localStorage.setItem('vitavoice_history', JSON.stringify(medicalHistory));
  }, [medicalHistory]);

  useEffect(() => {
    localStorage.setItem('vitavoice_autoplay', JSON.stringify(autoPlay));
  }, [autoPlay]);

  const addFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    const newMember = { ...member, id: Date.now().toString() };
    setFamilyMembers(prev => [...prev, newMember]);
  };

  const addChatMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage = {
      ...message,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, newMessage]);
  };

  const addHistoryEntry = (entry: Omit<HistoryEntry, 'id' | 'date'>) => {
    const newEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date()
    };
    setMedicalHistory(prev => [newEntry, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        isOnline,
        selectedLanguage,
        selectedLanguageCode,
        setSelectedLanguage,
        setSelectedLanguageCode,
        autoPlay,
        setAutoPlay,
        familyMembers,
        addFamilyMember,
        chatHistory,
        addChatMessage,
        medicalHistory,
        addHistoryEntry
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

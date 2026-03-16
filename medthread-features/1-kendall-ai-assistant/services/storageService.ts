// Offline-first storage service using IndexedDB

import type { FamilyMember, ChatMessage, HistoryEntry } from '@/app/context/AppContext';
import type { DiagnosticResult, FamilyMemberHealth } from '@/types/health';

const DB_NAME = 'VitaVoiceDB';
const DB_VERSION = 1;

const STORES = {
    FAMILY_MEMBERS: 'familyMembers',
    CHAT_HISTORY: 'chatHistory',
    MEDICAL_HISTORY: 'medicalHistory',
    DIAGNOSTIC_RESULTS: 'diagnosticResults',
    SYNC_QUEUE: 'syncQueue',
} as const;

class StorageService {
    private db: IDBDatabase | null = null;

    /**
     * Initialize IndexedDB
     */
    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create object stores
                if (!db.objectStoreNames.contains(STORES.FAMILY_MEMBERS)) {
                    db.createObjectStore(STORES.FAMILY_MEMBERS, { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains(STORES.CHAT_HISTORY)) {
                    const chatStore = db.createObjectStore(STORES.CHAT_HISTORY, { keyPath: 'id' });
                    chatStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.MEDICAL_HISTORY)) {
                    const historyStore = db.createObjectStore(STORES.MEDICAL_HISTORY, { keyPath: 'id' });
                    historyStore.createIndex('date', 'date', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.DIAGNOSTIC_RESULTS)) {
                    const diagnosticStore = db.createObjectStore(STORES.DIAGNOSTIC_RESULTS, { keyPath: 'id', autoIncrement: true });
                    diagnosticStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
                    db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    /**
     * Save family member
     */
    async saveFamilyMember(member: FamilyMember): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORES.FAMILY_MEMBERS], 'readwrite');
            const store = transaction.objectStore(STORES.FAMILY_MEMBERS);
            const request = store.put(member);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all family members
     */
    async getFamilyMembers(): Promise<FamilyMember[]> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORES.FAMILY_MEMBERS], 'readonly');
            const store = transaction.objectStore(STORES.FAMILY_MEMBERS);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Save chat message
     */
    async saveChatMessage(message: ChatMessage): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORES.CHAT_HISTORY], 'readwrite');
            const store = transaction.objectStore(STORES.CHAT_HISTORY);
            const request = store.put(message);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get chat history
     */
    async getChatHistory(limit?: number): Promise<ChatMessage[]> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORES.CHAT_HISTORY], 'readonly');
            const store = transaction.objectStore(STORES.CHAT_HISTORY);
            const index = store.index('timestamp');
            const request = index.openCursor(null, 'prev');

            const messages: ChatMessage[] = [];
            let count = 0;

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor && (!limit || count < limit)) {
                    messages.push(cursor.value);
                    count++;
                    cursor.continue();
                } else {
                    resolve(messages.reverse());
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Save medical history entry
     */
    async saveMedicalHistory(entry: HistoryEntry): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORES.MEDICAL_HISTORY], 'readwrite');
            const store = transaction.objectStore(STORES.MEDICAL_HISTORY);
            const request = store.put(entry);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get medical history
     */
    async getMedicalHistory(): Promise<HistoryEntry[]> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORES.MEDICAL_HISTORY], 'readonly');
            const store = transaction.objectStore(STORES.MEDICAL_HISTORY);
            const index = store.index('date');
            const request = index.getAll();

            request.onsuccess = () => resolve(request.result.reverse());
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Save diagnostic result
     */
    async saveDiagnosticResult(result: DiagnosticResult): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORES.DIAGNOSTIC_RESULTS], 'readwrite');
            const store = transaction.objectStore(STORES.DIAGNOSTIC_RESULTS);
            const request = store.add(result);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get diagnostic results
     */
    async getDiagnosticResults(limit?: number): Promise<DiagnosticResult[]> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORES.DIAGNOSTIC_RESULTS], 'readonly');
            const store = transaction.objectStore(STORES.DIAGNOSTIC_RESULTS);
            const index = store.index('timestamp');
            const request = index.openCursor(null, 'prev');

            const results: DiagnosticResult[] = [];
            let count = 0;

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor && (!limit || count < limit)) {
                    results.push(cursor.value);
                    count++;
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all data (for testing/reset)
     */
    async clearAllData(): Promise<void> {
        if (!this.db) await this.init();

        const stores = Object.values(STORES);
        const transaction = this.db!.transaction(stores, 'readwrite');

        for (const storeName of stores) {
            transaction.objectStore(storeName).clear();
        }

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    /**
     * Export all data as JSON
     */
    async exportData(): Promise<string> {
        const data = {
            familyMembers: await this.getFamilyMembers(),
            chatHistory: await this.getChatHistory(),
            medicalHistory: await this.getMedicalHistory(),
            diagnosticResults: await this.getDiagnosticResults(),
            exportDate: new Date().toISOString(),
        };

        return JSON.stringify(data, null, 2);
    }
}

export const storageService = new StorageService();

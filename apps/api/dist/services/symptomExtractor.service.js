"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYMPTOM_DICTIONARY = void 0;
exports.extractSymptoms = extractSymptoms;
exports.extractSeverity = extractSeverity;
exports.SYMPTOM_DICTIONARY = {
    'Fever': ['fever', 'high temperature', 'pyrexia', 'febrile', 'burning up'],
    'Headache': ['headache', 'head pain', 'migraine', 'head ache', 'throbbing head'],
    'Cough': ['cough', 'coughing', 'dry cough', 'wet cough', 'persistent cough'],
    'Nausea': ['nausea', 'nauseous', 'feel like vomiting', 'queasy', 'sick feeling'],
    'Vomiting': ['vomiting', 'vomit', 'threw up', 'throwing up', 'puking'],
    'Rash': ['rash', 'skin rash', 'redness', 'hives', 'eruption', 'itchy skin'],
    'Fatigue': ['fatigue', 'tired', 'exhausted', 'weakness', 'lethargy', 'no energy'],
    'Dizziness': ['dizziness', 'dizzy', 'vertigo', 'lightheaded', 'spinning'],
    'Chest Pain': ['chest pain', 'chest tightness', 'chest pressure', 'chest discomfort'],
    'Sore Throat': ['sore throat', 'throat pain', 'throat ache', 'scratchy throat'],
    'Shortness of Breath': ['shortness of breath', 'breathlessness', 'difficulty breathing', 'cant breathe'],
    'Body Ache': ['body ache', 'muscle pain', 'myalgia', 'body pain', 'aching'],
    'Diarrhea': ['diarrhea', 'loose stools', 'loose motion', 'watery stool'],
    'Loss of Appetite': ['loss of appetite', 'not eating', 'no appetite', 'anorexia'],
    'Runny Nose': ['runny nose', 'nasal discharge', 'sneezing', 'blocked nose', 'cold'],
};
function extractSymptoms(text) {
    const lower = text.toLowerCase();
    return Object.entries(exports.SYMPTOM_DICTIONARY)
        .filter(([, keywords]) => keywords.some(kw => lower.includes(kw)))
        .map(([symptom]) => symptom);
}
function extractSeverity(text) {
    const lower = text.toLowerCase();
    if (['severe', 'critical', 'extreme', 'unbearable', 'emergency'].some(w => lower.includes(w)))
        return 5;
    if (['very bad', 'really bad', 'high', 'intense', 'strong'].some(w => lower.includes(w)))
        return 4;
    if (['moderate', 'medium', 'somewhat', 'quite'].some(w => lower.includes(w)))
        return 3;
    if (['mild', 'slight', 'little', 'minor'].some(w => lower.includes(w)))
        return 2;
    return 3;
}

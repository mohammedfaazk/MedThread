"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymptomTag = void 0;
const react_1 = __importDefault(require("react"));
const SymptomTag = ({ label, category = 'general' }) => {
    const colors = {
        general: { bg: 'rgba(255, 209, 102, 0.15)', text: '#2D2D2D' },
        urgent: { bg: 'rgba(254, 226, 226, 0.8)', text: '#DC2626' },
        chronic: { bg: 'rgba(224, 242, 254, 0.8)', text: '#2563EB' }
    };
    const color = colors[category];
    return (react_1.default.createElement("span", { style: {
            display: 'inline-block',
            padding: '6px 12px',
            borderRadius: '999px',
            backgroundColor: color.bg,
            color: color.text,
            fontSize: '14px',
            fontWeight: 500,
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        } }, label));
};
exports.SymptomTag = SymptomTag;

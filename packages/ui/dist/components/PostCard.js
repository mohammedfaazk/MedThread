"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostCard = void 0;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const PostCard = ({ patientUsername, symptoms, doctorResponseCount, replyCount, upvotes, onClick }) => {
    return (react_1.default.createElement("div", { onClick: onClick, style: {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        }, onMouseEnter: (e) => {
            e.currentTarget.style.transform = 'scale(1.01)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
        }, onMouseLeave: (e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
        } },
        react_1.default.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' } },
            react_1.default.createElement("div", { style: {
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 209, 102, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    color: '#2D2D2D',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)'
                } }, patientUsername[0].toUpperCase()),
            react_1.default.createElement("span", { style: { fontWeight: 600, color: '#2D2D2D' } }, patientUsername)),
        react_1.default.createElement("div", { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' } }, symptoms.map((symptom, idx) => (react_1.default.createElement("span", { key: idx, style: {
                padding: '6px 12px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 209, 102, 0.15)',
                color: '#2D2D2D',
                fontSize: '14px',
                fontWeight: 500
            } }, symptom)))),
        react_1.default.createElement("div", { style: { display: 'flex', gap: '16px', fontSize: '14px', color: '#4B5563', alignItems: 'center' } },
            react_1.default.createElement("span", { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                react_1.default.createElement(lucide_react_1.MessageCircle, { style: { width: '16px', height: '16px' } }),
                replyCount,
                " replies"),
            doctorResponseCount > 0 && (react_1.default.createElement("span", { style: { color: '#FFD166', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' } },
                react_1.default.createElement(lucide_react_1.CheckCircle, { style: { width: '16px', height: '16px' } }),
                doctorResponseCount,
                " doctor responses")),
            react_1.default.createElement("span", { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                react_1.default.createElement(lucide_react_1.ThumbsUp, { style: { width: '16px', height: '16px' } }),
                upvotes))));
};
exports.PostCard = PostCard;

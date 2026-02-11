"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreadReply = void 0;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const ThreadReply = ({ authorName, authorRole, content, isDoctorVerified, helpfulCount, depth = 0 }) => {
    const isDoctor = authorRole === 'VERIFIED_DOCTOR';
    return (react_1.default.createElement("div", { style: {
            marginLeft: `${depth * 24}px`,
            borderLeft: depth > 0 ? '2px solid rgba(229, 231, 235, 0.5)' : 'none',
            paddingLeft: depth > 0 ? '16px' : '0',
            marginTop: '16px'
        } },
        react_1.default.createElement("div", { style: {
                backgroundColor: isDoctor ? 'rgba(255, 241, 224, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: '16px',
                border: isDoctor ? '2px solid rgba(255, 209, 102, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            } },
            react_1.default.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' } },
                react_1.default.createElement("span", { style: { fontWeight: 600, color: '#2D2D2D' } }, authorName),
                isDoctorVerified && (react_1.default.createElement("span", { style: {
                        backgroundColor: '#2D2D2D',
                        color: '#FFFFFF',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    } },
                    react_1.default.createElement(lucide_react_1.CheckCircle, { style: { width: '12px', height: '12px' } }),
                    "Verified Doctor"))),
            react_1.default.createElement("p", { style: { margin: 0, lineHeight: 1.6, color: '#374151' } }, content),
            react_1.default.createElement("div", { style: {
                    marginTop: '12px',
                    fontSize: '14px',
                    color: '#4B5563',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                } },
                react_1.default.createElement(lucide_react_1.ThumbsUp, { style: { width: '16px', height: '16px' } }),
                helpfulCount,
                " helpful"))));
};
exports.ThreadReply = ThreadReply;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorBadge = void 0;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const DoctorBadge = ({ doctorName, specialty, reputationScore }) => {
    return (react_1.default.createElement("div", { style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '999px',
            border: '2px solid rgba(255, 209, 102, 0.5)',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        } },
        react_1.default.createElement("div", { style: {
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#FFD166',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            } },
            react_1.default.createElement(lucide_react_1.CheckCircle, { style: { width: '16px', height: '16px', color: '#2D2D2D' } })),
        react_1.default.createElement("div", null,
            react_1.default.createElement("div", { style: { fontSize: '14px', fontWeight: 600, color: '#2D2D2D' } }, doctorName),
            specialty && (react_1.default.createElement("div", { style: { fontSize: '12px', color: '#4B5563' } }, specialty))),
        react_1.default.createElement("div", { style: {
                fontSize: '12px',
                color: '#FFD166',
                fontWeight: 600,
                marginLeft: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
            } },
            react_1.default.createElement(lucide_react_1.Star, { style: { width: '12px', height: '12px', fill: 'currentColor' } }),
            reputationScore)));
};
exports.DoctorBadge = DoctorBadge;

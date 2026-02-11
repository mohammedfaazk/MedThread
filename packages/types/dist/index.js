"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimelineEventType = exports.SeverityLevel = exports.VerificationStatus = exports.UserRole = void 0;
// User Roles
var UserRole;
(function (UserRole) {
    UserRole["PATIENT"] = "PATIENT";
    UserRole["VERIFIED_DOCTOR"] = "VERIFIED_DOCTOR";
    UserRole["NURSE"] = "NURSE";
    UserRole["MEDICAL_STUDENT"] = "MEDICAL_STUDENT";
    UserRole["PHARMACIST"] = "PHARMACIST";
    UserRole["COMMUNITY_CONTRIBUTOR"] = "COMMUNITY_CONTRIBUTOR";
})(UserRole || (exports.UserRole = UserRole = {}));
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "PENDING";
    VerificationStatus["VERIFIED"] = "VERIFIED";
    VerificationStatus["REJECTED"] = "REJECTED";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var SeverityLevel;
(function (SeverityLevel) {
    SeverityLevel["LOW"] = "LOW";
    SeverityLevel["MODERATE"] = "MODERATE";
    SeverityLevel["HIGH"] = "HIGH";
    SeverityLevel["EMERGENCY"] = "EMERGENCY";
})(SeverityLevel || (exports.SeverityLevel = SeverityLevel = {}));
var TimelineEventType;
(function (TimelineEventType) {
    TimelineEventType["SYMPTOM_START"] = "SYMPTOM_START";
    TimelineEventType["DOCTOR_ADVICE"] = "DOCTOR_ADVICE";
    TimelineEventType["TEST_RESULTS"] = "TEST_RESULTS";
    TimelineEventType["MEDICATION_UPDATE"] = "MEDICATION_UPDATE";
    TimelineEventType["RECOVERY_LOG"] = "RECOVERY_LOG";
})(TimelineEventType || (exports.TimelineEventType = TimelineEventType = {}));

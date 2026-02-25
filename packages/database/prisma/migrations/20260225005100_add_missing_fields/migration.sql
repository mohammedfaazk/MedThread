/*
  Warnings:

  - You are about to drop the column `follow_up_recommended` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `journey_id` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `prescription_issued` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `questionnaire_completed` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `reminder_count` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `review_requested` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `account_suspended` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `achievements_count` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `badges_count` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `consultation_count` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `content_violations` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `current_streak_days` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `current_subscription_tier` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dashboard_last_viewed` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `date_of_birth` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `featured_until` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gamification_level` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `google_indexed` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hospital_verified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `identity_verified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `insurance_provider` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `is_featured` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `is_premium_member` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `is_rising_star` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `is_trending` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `last_seo_update` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `license_verification_date` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `license_verified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lifetime_patients` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `location_sharing_enabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `location_updated_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `overall_rating` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `peer_endorsement_count` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferred_language` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profile_views` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `promotion_tier` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `response_time_avg` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `seo_slug` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_end_date` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_status` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `suspended_until` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `suspension_reason` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `total_gamification_points` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `total_revenue` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `total_reviews` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `trust_level` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `trust_score` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Achievement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AdImpression` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Advertisement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AppointmentReminder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Badge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookingCTA` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CaseHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClinicException` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClinicHours` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConflictingDiagnosis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConsultationCommission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContentModeration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DataInsight` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DistanceCache` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorAchievement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorAvailability` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorBadge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorBusinessAnalytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorClinic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorComparison` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorExpertise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorGoals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorInsurance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorLanguage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorPoints` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorPromotion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorQualityReview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorRating` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorRegionalRank` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorRevenue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorReview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorRisingStar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorSEOProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorSpecialtyRank` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorSubscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorTrending` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FeaturedDoctor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FollowUpAppointment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HospitalAffiliationVerification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Leaderboard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LeaderboardEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LocalSEO` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MatchingFeedback` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MatchingPreference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MatchingResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MedicalAdvicePeerReview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MedicalLicenseVerification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PatientIdentityVerification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PatientJourney` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PatientRetention` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PatientTestimonial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PeerEndorsement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlatformRevenue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PointsTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PreConsultationQuestionnaire` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PremiumListing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Prescription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RevenueTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReviewHelpful` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReviewRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RichSnippet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SEOAnalytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SEOContent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SponsoredAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubscriptionTier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SymptomCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TopSearchPromotion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrustScore` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Achievement" DROP CONSTRAINT "Achievement_badge_id_fkey";

-- DropForeignKey
ALTER TABLE "AdImpression" DROP CONSTRAINT "AdImpression_ad_id_fkey";

-- DropForeignKey
ALTER TABLE "AdImpression" DROP CONSTRAINT "AdImpression_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_journey_id_fkey";

-- DropForeignKey
ALTER TABLE "AppointmentReminder" DROP CONSTRAINT "AppointmentReminder_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "AppointmentReminder" DROP CONSTRAINT "AppointmentReminder_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "AppointmentReminder" DROP CONSTRAINT "AppointmentReminder_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "BookingCTA" DROP CONSTRAINT "BookingCTA_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "CaseHistory" DROP CONSTRAINT "CaseHistory_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "CaseHistory" DROP CONSTRAINT "CaseHistory_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "ClinicException" DROP CONSTRAINT "ClinicException_clinic_id_fkey";

-- DropForeignKey
ALTER TABLE "ClinicHours" DROP CONSTRAINT "ClinicHours_clinic_id_fkey";

-- DropForeignKey
ALTER TABLE "ConflictingDiagnosis" DROP CONSTRAINT "ConflictingDiagnosis_expert_reviewer_id_fkey";

-- DropForeignKey
ALTER TABLE "ConflictingDiagnosis" DROP CONSTRAINT "ConflictingDiagnosis_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "ConflictingDiagnosis" DROP CONSTRAINT "ConflictingDiagnosis_post_id_fkey";

-- DropForeignKey
ALTER TABLE "ConflictingDiagnosis" DROP CONSTRAINT "ConflictingDiagnosis_response_1_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "ConflictingDiagnosis" DROP CONSTRAINT "ConflictingDiagnosis_response_1_id_fkey";

-- DropForeignKey
ALTER TABLE "ConflictingDiagnosis" DROP CONSTRAINT "ConflictingDiagnosis_response_2_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "ConflictingDiagnosis" DROP CONSTRAINT "ConflictingDiagnosis_response_2_id_fkey";

-- DropForeignKey
ALTER TABLE "ConsultationCommission" DROP CONSTRAINT "ConsultationCommission_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "ConsultationCommission" DROP CONSTRAINT "ConsultationCommission_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "ConsultationCommission" DROP CONSTRAINT "ConsultationCommission_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "ContentModeration" DROP CONSTRAINT "ContentModeration_appeal_reviewed_by_fkey";

-- DropForeignKey
ALTER TABLE "ContentModeration" DROP CONSTRAINT "ContentModeration_author_id_fkey";

-- DropForeignKey
ALTER TABLE "ContentModeration" DROP CONSTRAINT "ContentModeration_reviewed_by_fkey";

-- DropForeignKey
ALTER TABLE "DistanceCache" DROP CONSTRAINT "DistanceCache_clinic_id_fkey";

-- DropForeignKey
ALTER TABLE "DistanceCache" DROP CONSTRAINT "DistanceCache_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorAchievement" DROP CONSTRAINT "DoctorAchievement_achievement_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorAchievement" DROP CONSTRAINT "DoctorAchievement_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorAvailability" DROP CONSTRAINT "DoctorAvailability_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorBadge" DROP CONSTRAINT "DoctorBadge_badge_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorBadge" DROP CONSTRAINT "DoctorBadge_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorBusinessAnalytics" DROP CONSTRAINT "DoctorBusinessAnalytics_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorClinic" DROP CONSTRAINT "DoctorClinic_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorComparison" DROP CONSTRAINT "DoctorComparison_doctor_a_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorComparison" DROP CONSTRAINT "DoctorComparison_doctor_b_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorExpertise" DROP CONSTRAINT "DoctorExpertise_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorGoals" DROP CONSTRAINT "DoctorGoals_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorInsurance" DROP CONSTRAINT "DoctorInsurance_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorLanguage" DROP CONSTRAINT "DoctorLanguage_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorPoints" DROP CONSTRAINT "DoctorPoints_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorPromotion" DROP CONSTRAINT "DoctorPromotion_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorQualityReview" DROP CONSTRAINT "DoctorQualityReview_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorQualityReview" DROP CONSTRAINT "DoctorQualityReview_reviewed_by_fkey";

-- DropForeignKey
ALTER TABLE "DoctorRating" DROP CONSTRAINT "DoctorRating_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorRegionalRank" DROP CONSTRAINT "DoctorRegionalRank_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorResponse" DROP CONSTRAINT "DoctorResponse_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorResponse" DROP CONSTRAINT "DoctorResponse_review_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorResponse" DROP CONSTRAINT "DoctorResponse_testimonial_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorRevenue" DROP CONSTRAINT "DoctorRevenue_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorRevenue" DROP CONSTRAINT "DoctorRevenue_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorRevenue" DROP CONSTRAINT "DoctorRevenue_promotion_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorReview" DROP CONSTRAINT "DoctorReview_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorReview" DROP CONSTRAINT "DoctorReview_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorReview" DROP CONSTRAINT "DoctorReview_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorRisingStar" DROP CONSTRAINT "DoctorRisingStar_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorSEOProfile" DROP CONSTRAINT "DoctorSEOProfile_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorSpecialtyRank" DROP CONSTRAINT "DoctorSpecialtyRank_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorSubscription" DROP CONSTRAINT "DoctorSubscription_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorSubscription" DROP CONSTRAINT "DoctorSubscription_tier_id_fkey";

-- DropForeignKey
ALTER TABLE "DoctorTrending" DROP CONSTRAINT "DoctorTrending_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "FeaturedDoctor" DROP CONSTRAINT "FeaturedDoctor_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "FeaturedDoctor" DROP CONSTRAINT "FeaturedDoctor_promotion_id_fkey";

-- DropForeignKey
ALTER TABLE "FollowUpAppointment" DROP CONSTRAINT "FollowUpAppointment_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "FollowUpAppointment" DROP CONSTRAINT "FollowUpAppointment_follow_up_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "FollowUpAppointment" DROP CONSTRAINT "FollowUpAppointment_original_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "FollowUpAppointment" DROP CONSTRAINT "FollowUpAppointment_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "HospitalAffiliationVerification" DROP CONSTRAINT "HospitalAffiliationVerification_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "HospitalAffiliationVerification" DROP CONSTRAINT "HospitalAffiliationVerification_verified_by_fkey";

-- DropForeignKey
ALTER TABLE "LeaderboardEntry" DROP CONSTRAINT "LeaderboardEntry_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "LeaderboardEntry" DROP CONSTRAINT "LeaderboardEntry_leaderboard_id_fkey";

-- DropForeignKey
ALTER TABLE "LocalSEO" DROP CONSTRAINT "LocalSEO_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "MatchingFeedback" DROP CONSTRAINT "MatchingFeedback_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "MatchingFeedback" DROP CONSTRAINT "MatchingFeedback_matching_result_id_fkey";

-- DropForeignKey
ALTER TABLE "MatchingFeedback" DROP CONSTRAINT "MatchingFeedback_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "MatchingPreference" DROP CONSTRAINT "MatchingPreference_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "MatchingResult" DROP CONSTRAINT "MatchingResult_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "MatchingResult" DROP CONSTRAINT "MatchingResult_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "MedicalAdvicePeerReview" DROP CONSTRAINT "MedicalAdvicePeerReview_author_id_fkey";

-- DropForeignKey
ALTER TABLE "MedicalAdvicePeerReview" DROP CONSTRAINT "MedicalAdvicePeerReview_requested_by_fkey";

-- DropForeignKey
ALTER TABLE "MedicalAdvicePeerReview" DROP CONSTRAINT "MedicalAdvicePeerReview_reviewer_id_fkey";

-- DropForeignKey
ALTER TABLE "MedicalLicenseVerification" DROP CONSTRAINT "MedicalLicenseVerification_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "MedicalLicenseVerification" DROP CONSTRAINT "MedicalLicenseVerification_verified_by_fkey";

-- DropForeignKey
ALTER TABLE "PatientIdentityVerification" DROP CONSTRAINT "PatientIdentityVerification_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "PatientIdentityVerification" DROP CONSTRAINT "PatientIdentityVerification_verified_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "PatientIdentityVerification" DROP CONSTRAINT "PatientIdentityVerification_verified_by_fkey";

-- DropForeignKey
ALTER TABLE "PatientJourney" DROP CONSTRAINT "PatientJourney_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "PatientJourney" DROP CONSTRAINT "PatientJourney_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "PatientJourney" DROP CONSTRAINT "PatientJourney_follow_up_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "PatientJourney" DROP CONSTRAINT "PatientJourney_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "PatientRetention" DROP CONSTRAINT "PatientRetention_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "PatientRetention" DROP CONSTRAINT "PatientRetention_first_consultation_id_fkey";

-- DropForeignKey
ALTER TABLE "PatientRetention" DROP CONSTRAINT "PatientRetention_last_consultation_id_fkey";

-- DropForeignKey
ALTER TABLE "PatientRetention" DROP CONSTRAINT "PatientRetention_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "PatientTestimonial" DROP CONSTRAINT "PatientTestimonial_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "PatientTestimonial" DROP CONSTRAINT "PatientTestimonial_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "PatientTestimonial" DROP CONSTRAINT "PatientTestimonial_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "PeerEndorsement" DROP CONSTRAINT "PeerEndorsement_endorsed_id_fkey";

-- DropForeignKey
ALTER TABLE "PeerEndorsement" DROP CONSTRAINT "PeerEndorsement_endorser_id_fkey";

-- DropForeignKey
ALTER TABLE "PointsTransaction" DROP CONSTRAINT "PointsTransaction_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "PreConsultationQuestionnaire" DROP CONSTRAINT "PreConsultationQuestionnaire_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "PreConsultationQuestionnaire" DROP CONSTRAINT "PreConsultationQuestionnaire_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "PreConsultationQuestionnaire" DROP CONSTRAINT "PreConsultationQuestionnaire_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "PremiumListing" DROP CONSTRAINT "PremiumListing_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "RevenueTransaction" DROP CONSTRAINT "RevenueTransaction_ad_id_fkey";

-- DropForeignKey
ALTER TABLE "RevenueTransaction" DROP CONSTRAINT "RevenueTransaction_commission_id_fkey";

-- DropForeignKey
ALTER TABLE "RevenueTransaction" DROP CONSTRAINT "RevenueTransaction_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "RevenueTransaction" DROP CONSTRAINT "RevenueTransaction_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "RevenueTransaction" DROP CONSTRAINT "RevenueTransaction_subscription_id_fkey";

-- DropForeignKey
ALTER TABLE "ReviewHelpful" DROP CONSTRAINT "ReviewHelpful_review_id_fkey";

-- DropForeignKey
ALTER TABLE "ReviewHelpful" DROP CONSTRAINT "ReviewHelpful_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ReviewRequest" DROP CONSTRAINT "ReviewRequest_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "ReviewRequest" DROP CONSTRAINT "ReviewRequest_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "ReviewRequest" DROP CONSTRAINT "ReviewRequest_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "SEOContent" DROP CONSTRAINT "SEOContent_author_id_fkey";

-- DropForeignKey
ALTER TABLE "SponsoredAnswer" DROP CONSTRAINT "SponsoredAnswer_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "SponsoredAnswer" DROP CONSTRAINT "SponsoredAnswer_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "SponsoredAnswer" DROP CONSTRAINT "SponsoredAnswer_post_id_fkey";

-- DropForeignKey
ALTER TABLE "SponsoredAnswer" DROP CONSTRAINT "SponsoredAnswer_promotion_id_fkey";

-- DropForeignKey
ALTER TABLE "TopSearchPromotion" DROP CONSTRAINT "TopSearchPromotion_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "TopSearchPromotion" DROP CONSTRAINT "TopSearchPromotion_promotion_id_fkey";

-- DropForeignKey
ALTER TABLE "TrustScore" DROP CONSTRAINT "TrustScore_user_id_fkey";

-- DropIndex
DROP INDEX "idx_appointment_journey";

-- DropIndex
DROP INDEX "Post_isPrivate_idx";

-- DropIndex
DROP INDEX "idx_user_gamification_level";

-- DropIndex
DROP INDEX "idx_user_gamification_points";

-- DropIndex
DROP INDEX "idx_user_gender";

-- DropIndex
DROP INDEX "idx_user_insurance";

-- DropIndex
DROP INDEX "idx_user_language";

-- DropIndex
DROP INDEX "idx_user_license_verified";

-- DropIndex
DROP INDEX "idx_user_premium";

-- DropIndex
DROP INDEX "idx_user_promotion_tier";

-- DropIndex
DROP INDEX "idx_user_subscription_tier";

-- DropIndex
DROP INDEX "idx_user_suspended";

-- DropIndex
DROP INDEX "idx_user_trust_score";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "follow_up_recommended",
DROP COLUMN "journey_id",
DROP COLUMN "prescription_issued",
DROP COLUMN "questionnaire_completed",
DROP COLUMN "reminder_count",
DROP COLUMN "review_requested",
ADD COLUMN     "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "doctorId" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastMessageAt" TIMESTAMP(3),
ADD COLUMN     "patientId" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isEdited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "account_suspended",
DROP COLUMN "achievements_count",
DROP COLUMN "badges_count",
DROP COLUMN "consultation_count",
DROP COLUMN "content_violations",
DROP COLUMN "current_streak_days",
DROP COLUMN "current_subscription_tier",
DROP COLUMN "dashboard_last_viewed",
DROP COLUMN "date_of_birth",
DROP COLUMN "featured_until",
DROP COLUMN "gamification_level",
DROP COLUMN "gender",
DROP COLUMN "google_indexed",
DROP COLUMN "hospital_verified",
DROP COLUMN "identity_verified",
DROP COLUMN "insurance_provider",
DROP COLUMN "is_featured",
DROP COLUMN "is_premium_member",
DROP COLUMN "is_rising_star",
DROP COLUMN "is_trending",
DROP COLUMN "last_seo_update",
DROP COLUMN "latitude",
DROP COLUMN "license_verification_date",
DROP COLUMN "license_verified",
DROP COLUMN "lifetime_patients",
DROP COLUMN "location_sharing_enabled",
DROP COLUMN "location_updated_at",
DROP COLUMN "longitude",
DROP COLUMN "overall_rating",
DROP COLUMN "peer_endorsement_count",
DROP COLUMN "preferred_language",
DROP COLUMN "profile_views",
DROP COLUMN "promotion_tier",
DROP COLUMN "response_time_avg",
DROP COLUMN "seo_slug",
DROP COLUMN "subscription_end_date",
DROP COLUMN "subscription_status",
DROP COLUMN "suspended_until",
DROP COLUMN "suspension_reason",
DROP COLUMN "total_gamification_points",
DROP COLUMN "total_revenue",
DROP COLUMN "total_reviews",
DROP COLUMN "trust_level",
DROP COLUMN "trust_score",
ADD COLUMN     "consultationFee" DECIMAL(10,2),
ADD COLUMN     "twoFactorSecret" TEXT;

-- DropTable
DROP TABLE "Achievement";

-- DropTable
DROP TABLE "AdImpression";

-- DropTable
DROP TABLE "Advertisement";

-- DropTable
DROP TABLE "AppointmentReminder";

-- DropTable
DROP TABLE "Badge";

-- DropTable
DROP TABLE "BookingCTA";

-- DropTable
DROP TABLE "CaseHistory";

-- DropTable
DROP TABLE "ClinicException";

-- DropTable
DROP TABLE "ClinicHours";

-- DropTable
DROP TABLE "ConflictingDiagnosis";

-- DropTable
DROP TABLE "ConsultationCommission";

-- DropTable
DROP TABLE "ContentModeration";

-- DropTable
DROP TABLE "DataInsight";

-- DropTable
DROP TABLE "DistanceCache";

-- DropTable
DROP TABLE "DoctorAchievement";

-- DropTable
DROP TABLE "DoctorAvailability";

-- DropTable
DROP TABLE "DoctorBadge";

-- DropTable
DROP TABLE "DoctorBusinessAnalytics";

-- DropTable
DROP TABLE "DoctorClinic";

-- DropTable
DROP TABLE "DoctorComparison";

-- DropTable
DROP TABLE "DoctorExpertise";

-- DropTable
DROP TABLE "DoctorGoals";

-- DropTable
DROP TABLE "DoctorInsurance";

-- DropTable
DROP TABLE "DoctorLanguage";

-- DropTable
DROP TABLE "DoctorPoints";

-- DropTable
DROP TABLE "DoctorPromotion";

-- DropTable
DROP TABLE "DoctorQualityReview";

-- DropTable
DROP TABLE "DoctorRating";

-- DropTable
DROP TABLE "DoctorRegionalRank";

-- DropTable
DROP TABLE "DoctorResponse";

-- DropTable
DROP TABLE "DoctorRevenue";

-- DropTable
DROP TABLE "DoctorReview";

-- DropTable
DROP TABLE "DoctorRisingStar";

-- DropTable
DROP TABLE "DoctorSEOProfile";

-- DropTable
DROP TABLE "DoctorSpecialtyRank";

-- DropTable
DROP TABLE "DoctorSubscription";

-- DropTable
DROP TABLE "DoctorTrending";

-- DropTable
DROP TABLE "FeaturedDoctor";

-- DropTable
DROP TABLE "FollowUpAppointment";

-- DropTable
DROP TABLE "HospitalAffiliationVerification";

-- DropTable
DROP TABLE "Leaderboard";

-- DropTable
DROP TABLE "LeaderboardEntry";

-- DropTable
DROP TABLE "LocalSEO";

-- DropTable
DROP TABLE "MatchingFeedback";

-- DropTable
DROP TABLE "MatchingPreference";

-- DropTable
DROP TABLE "MatchingResult";

-- DropTable
DROP TABLE "MedicalAdvicePeerReview";

-- DropTable
DROP TABLE "MedicalLicenseVerification";

-- DropTable
DROP TABLE "PatientIdentityVerification";

-- DropTable
DROP TABLE "PatientJourney";

-- DropTable
DROP TABLE "PatientRetention";

-- DropTable
DROP TABLE "PatientTestimonial";

-- DropTable
DROP TABLE "PeerEndorsement";

-- DropTable
DROP TABLE "PlatformRevenue";

-- DropTable
DROP TABLE "PointsTransaction";

-- DropTable
DROP TABLE "PreConsultationQuestionnaire";

-- DropTable
DROP TABLE "PremiumListing";

-- DropTable
DROP TABLE "Prescription";

-- DropTable
DROP TABLE "RevenueTransaction";

-- DropTable
DROP TABLE "ReviewHelpful";

-- DropTable
DROP TABLE "ReviewRequest";

-- DropTable
DROP TABLE "RichSnippet";

-- DropTable
DROP TABLE "SEOAnalytics";

-- DropTable
DROP TABLE "SEOContent";

-- DropTable
DROP TABLE "SponsoredAnswer";

-- DropTable
DROP TABLE "SubscriptionTier";

-- DropTable
DROP TABLE "SymptomCategory";

-- DropTable
DROP TABLE "TopSearchPromotion";

-- DropTable
DROP TABLE "TrustScore";

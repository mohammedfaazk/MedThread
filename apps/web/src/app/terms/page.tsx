'use client';

import { Navbar } from '@/components/Navbar';
import { AlertTriangle } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last Updated: March 23, 2026</p>

          {/* Critical Medical Disclaimer */}
          <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r mb-8">
            <div className="flex gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-bold text-red-900 mb-2">
                  IMPORTANT MEDICAL DISCLAIMER
                </h2>
                <p className="text-red-800 leading-relaxed">
                  MedThread is NOT a medical service provider and does NOT provide medical advice, diagnosis, or treatment. 
                  The platform is for informational and educational purposes only. Always seek the advice of your physician 
                  or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-gray max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using MedThread ("the Platform"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the Platform.
            </p>

            <h2>2. Medical Disclaimer and Limitations</h2>
            
            <h3>2.1 Not Medical Advice</h3>
            <p>
              The Platform provides a space for healthcare professionals and patients to share information and experiences. 
              <strong> Nothing on this Platform constitutes professional medical advice, diagnosis, or treatment.</strong>
            </p>

            <h3>2.2 No Doctor-Patient Relationship</h3>
            <p>
              Use of the Platform does not create a doctor-patient relationship between you and any healthcare professional 
              on the Platform. Any information provided by healthcare professionals is for general informational purposes only.
            </p>

            <h3>2.3 Emergency Situations</h3>
            <p className="bg-amber-50 border border-amber-200 p-4 rounded">
              <strong>⚠️ EMERGENCY NOTICE:</strong> If you are experiencing a medical emergency, call emergency services 
              immediately (India: 112, US: 911, UK: 999). Do not rely on the Platform for emergency medical assistance.
            </p>

            <h3>2.4 Verify Information</h3>
            <p>
              Always verify any medical information with your healthcare provider. Do not disregard professional medical 
              advice or delay seeking it because of something you read on the Platform.
            </p>

            <h2>3. User Responsibilities</h2>
            
            <h3>3.1 Age Requirement</h3>
            <p>
              You must be at least 18 years old to use the Platform. If you are under 18, you may only use the Platform 
              with the involvement of a parent or guardian.
            </p>

            <h3>3.2 Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities 
              that occur under your account.
            </p>

            <h3>3.3 Accurate Information</h3>
            <p>
              You agree to provide accurate, current, and complete information when creating your account and using the Platform. 
              Healthcare professionals must provide valid credentials and maintain current licensure.
            </p>

            <h3>3.4 Prohibited Conduct</h3>
            <p>You agree NOT to:</p>
            <ul>
              <li>Provide false or misleading medical information</li>
              <li>Impersonate any person or entity</li>
              <li>Share another person's private health information without consent</li>
              <li>Use the Platform for any illegal purpose</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to gain unauthorized access to the Platform</li>
              <li>Post spam, advertisements, or promotional content</li>
            </ul>

            <h2>4. Healthcare Professional Responsibilities</h2>
            
            <h3>4.1 Verification</h3>
            <p>
              Healthcare professionals must provide valid credentials for verification. Misrepresentation of credentials 
              will result in immediate account termination and may be reported to relevant authorities.
            </p>

            <h3>4.2 Professional Standards</h3>
            <p>
              Healthcare professionals must adhere to their professional codes of conduct and applicable laws when using 
              the Platform. They remain responsible for their own professional liability.
            </p>

            <h3>4.3 Scope of Interaction</h3>
            <p>
              Healthcare professionals should limit their interactions to general educational information and should not 
              provide specific medical advice, prescriptions, or treatment plans through the Platform.
            </p>

            <h2>5. Privacy and Data Protection</h2>
            
            <h3>5.1 Health Information</h3>
            <p>
              We take the privacy of your health information seriously. Please review our Privacy Policy to understand 
              how we collect, use, and protect your information.
            </p>

            <h3>5.2 Public Content</h3>
            <p>
              Any content you post publicly on the Platform may be viewed by other users. Do not share personally 
              identifiable information or sensitive health details in public posts.
            </p>

            <h3>5.3 Data Security</h3>
            <p>
              While we implement security measures to protect your data, no system is completely secure. You use the 
              Platform at your own risk.
            </p>

            <h2>6. Content and Intellectual Property</h2>
            
            <h3>6.1 User Content</h3>
            <p>
              You retain ownership of content you post on the Platform. By posting content, you grant us a non-exclusive, 
              worldwide, royalty-free license to use, display, and distribute your content on the Platform.
            </p>

            <h3>6.2 Platform Content</h3>
            <p>
              The Platform and its original content, features, and functionality are owned by MedThread and are protected 
              by international copyright, trademark, and other intellectual property laws.
            </p>

            <h3>6.3 Medical Content Accuracy</h3>
            <p>
              We do not guarantee the accuracy, completeness, or usefulness of any medical information on the Platform. 
              Users are responsible for verifying information with qualified healthcare providers.
            </p>

            <h2>7. Limitation of Liability</h2>
            
            <p className="bg-gray-50 border border-gray-300 p-4 rounded">
              <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
            </p>
            
            <p>
              MedThread, its officers, directors, employees, and agents SHALL NOT BE LIABLE for any indirect, incidental, 
              special, consequential, or punitive damages, including but not limited to:
            </p>
            <ul>
              <li>Medical complications or adverse health outcomes</li>
              <li>Reliance on information provided on the Platform</li>
              <li>Delays in seeking medical treatment</li>
              <li>Loss of data or access to the Platform</li>
              <li>Any other damages arising from use of the Platform</li>
            </ul>

            <h2>8. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless MedThread and its affiliates from any claims, damages, losses, 
              liabilities, and expenses (including legal fees) arising from:
            </p>
            <ul>
              <li>Your use of the Platform</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another user</li>
              <li>Content you post on the Platform</li>
            </ul>

            <h2>9. Content Moderation</h2>
            
            <h3>9.1 Right to Remove Content</h3>
            <p>
              We reserve the right to remove any content that violates these Terms, is harmful, or is otherwise 
              objectionable, at our sole discretion.
            </p>

            <h3>9.2 Account Suspension</h3>
            <p>
              We may suspend or terminate your account for violations of these Terms, illegal activity, or behavior 
              that harms other users or the Platform.
            </p>

            <h2>10. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We will notify users of significant changes via email or Platform 
              notification. Continued use of the Platform after changes constitutes acceptance of the modified Terms.
            </p>

            <h2>11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to 
              its conflict of law provisions.
            </p>

            <h2>12. Contact Information</h2>
            <p>
              If you have questions about these Terms, please contact us at:
            </p>
            <p>
              Email: legal@medthread.com<br />
              Address: [Your Company Address]
            </p>

            <h2>13. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited 
              or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
            </p>

            <h2>14. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and MedThread 
              regarding use of the Platform.
            </p>

            <div className="bg-blue-50 border border-blue-200 p-6 rounded mt-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                By using MedThread, you acknowledge that:
              </h3>
              <ul className="text-blue-800 space-y-2">
                <li>✓ You have read and understood these Terms of Service</li>
                <li>✓ You understand this Platform does not provide medical advice</li>
                <li>✓ You will not rely on the Platform for emergency medical situations</li>
                <li>✓ You will verify all medical information with qualified healthcare providers</li>
                <li>✓ You accept all risks associated with using the Platform</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

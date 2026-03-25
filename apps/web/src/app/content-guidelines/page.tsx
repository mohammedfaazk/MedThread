import React from 'react';

export default function ContentGuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Medical Content Guidelines</h1>
      
      <div className="prose prose-lg max-w-none">
        {/* Critical Medical Disclaimer */}
        <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8">
          <h2 className="text-2xl font-bold text-red-800 mt-0">🚨 Critical Medical Disclaimer</h2>
          <p className="text-red-700">
            <strong>This platform provides general health information only and is NOT a substitute for professional medical advice, diagnosis, or treatment.</strong> Healthcare professionals on this platform are providing educational information only and are NOT establishing a doctor-patient relationship.
          </p>
          <p className="text-red-700 mb-0">
            <strong>EMERGENCY:</strong> If you are experiencing a medical emergency, call emergency services immediately (India: 112, US: 911, UK: 999). Do NOT rely on this platform for emergency medical assistance.
          </p>
        </div>

        {/* For Patients */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">📋 Guidelines for Patients</h2>
          
          <h3 className="text-xl font-semibold mb-3">✅ DO:</h3>
          <ul className="space-y-2">
            <li>Provide accurate and complete information about your symptoms</li>
            <li>Be respectful and courteous in all interactions</li>
            <li>Use the platform for general health information and education</li>
            <li>Follow up with your local healthcare provider for proper medical care</li>
            <li>Report any inappropriate or harmful content</li>
            <li>Protect your privacy - avoid sharing sensitive personal information</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">❌ DON'T:</h3>
          <ul className="space-y-2">
            <li>Use this platform for medical emergencies</li>
            <li>Share explicit photos or graphic medical images without warnings</li>
            <li>Self-diagnose or self-medicate based solely on online advice</li>
            <li>Harass, bully, or attack other users</li>
            <li>Post spam, promotional content, or advertisements</li>
            <li>Share false or misleading medical information</li>
          </ul>
        </section>

        {/* For Doctors */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">⚕️ Guidelines for Healthcare Professionals</h2>
          
          <h3 className="text-xl font-semibold mb-3">✅ DO:</h3>
          <ul className="space-y-2">
            <li>Provide evidence-based, accurate medical information</li>
            <li>Include appropriate medical disclaimers in your responses</li>
            <li>Recommend patients seek in-person medical care when appropriate</li>
            <li>Maintain professional boundaries and ethics</li>
            <li>Report any medical misinformation you encounter</li>
            <li>Verify your credentials and keep your license information updated</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">❌ DON'T:</h3>
          <ul className="space-y-2">
            <li>Provide specific diagnoses through online interactions</li>
            <li>Prescribe medications or specific treatment plans online</li>
            <li>Guarantee outcomes or make unrealistic promises</li>
            <li>Share patient information without consent</li>
            <li>Engage in self-promotion or advertising</li>
            <li>Provide emergency medical care through the platform</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
            <p className="text-yellow-800 mb-0">
              <strong>Professional Liability:</strong> All healthcare professionals must acknowledge that online interactions do not establish a doctor-patient relationship. Liability waivers are required for certain interactions.
            </p>
          </div>
        </section>

        {/* Content Standards */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">📝 Content Standards</h2>
          
          <h3 className="text-xl font-semibold mb-3">Medical Accuracy</h3>
          <p>All medical content is subject to verification by our AI system and medical professionals. Content that is:</p>
          <ul>
            <li>Medically inaccurate or misleading</li>
            <li>Promotes unproven treatments or "miracle cures"</li>
            <li>Contradicts established medical science</li>
            <li>Could cause harm if followed</li>
          </ul>
          <p>...will be flagged, reviewed, or removed.</p>

          <h3 className="text-xl font-semibold mb-3 mt-6">Prohibited Content</h3>
          <ul className="space-y-2">
            <li><strong>Spam:</strong> Promotional content, advertisements, repetitive posts</li>
            <li><strong>Harassment:</strong> Bullying, threats, personal attacks, hate speech</li>
            <li><strong>Misinformation:</strong> False medical claims, conspiracy theories, anti-vaccine propaganda</li>
            <li><strong>Inappropriate:</strong> NSFW content without warnings, explicit material</li>
            <li><strong>Violence:</strong> Threats, graphic descriptions, self-harm content</li>
            <li><strong>Illegal:</strong> Drug solicitation, illegal activities, fraud</li>
          </ul>
        </section>

        {/* Moderation Process */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">⚖️ Moderation Process</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">1. Automated Screening</h3>
              <p>All content is automatically screened for:</p>
              <ul>
                <li>Toxicity and inappropriate language</li>
                <li>Spam patterns and promotional content</li>
                <li>Medical accuracy and safety concerns</li>
                <li>Emergency keywords requiring immediate attention</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg">2. AI Verification</h3>
              <p>Medical content is verified using AI to assess:</p>
              <ul>
                <li>Medical accuracy (0-100% confidence score)</li>
                <li>Risk level (LOW, MEDIUM, HIGH, CRITICAL)</li>
                <li>Safety concerns and potential harm</li>
                <li>Need for human review</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg">3. Human Review</h3>
              <p>Flagged content is reviewed by moderators who can:</p>
              <ul>
                <li>Approve content that meets guidelines</li>
                <li>Remove content that violates policies</li>
                <li>Request edits or clarifications</li>
                <li>Issue warnings or suspensions</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Reporting */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">🚩 Reporting Content</h2>
          <p>If you see content that violates these guidelines:</p>
          <ol>
            <li>Click the "Report" button on the post or comment</li>
            <li>Select the reason for reporting</li>
            <li>Provide additional details if needed</li>
            <li>Our moderation team will review within 24 hours</li>
          </ol>
        </section>

        {/* Consequences */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">⚠️ Consequences of Violations</h2>
          <ul className="space-y-2">
            <li><strong>First Violation:</strong> Warning and content removal</li>
            <li><strong>Second Violation:</strong> Temporary suspension (7 days)</li>
            <li><strong>Third Violation:</strong> Temporary suspension (30 days)</li>
            <li><strong>Severe/Repeated Violations:</strong> Permanent ban</li>
          </ul>
          <p className="mt-4">
            <strong>Note:</strong> Severe violations (threats, illegal content, severe misinformation) may result in immediate permanent ban.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-blue-50 border-l-4 border-blue-500 p-6">
          <h2 className="text-xl font-bold mb-2 mt-0">📧 Questions or Appeals?</h2>
          <p className="mb-0">
            If you have questions about these guidelines or wish to appeal a moderation decision, contact us at <strong>moderation@medthread.com</strong>
          </p>
        </section>

        {/* Last Updated */}
        <div className="text-sm text-gray-500 mt-8 text-center">
          Last Updated: March 23, 2026
        </div>
      </div>
    </div>
  );
}

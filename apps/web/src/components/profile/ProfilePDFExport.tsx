'use client'

import { Download } from 'lucide-react'

interface ProfilePDFExportProps {
  profile: any
  doctorInfo: any
}

export default function ProfilePDFExport({ profile, doctorInfo }: ProfilePDFExportProps) {
  const generatePDF = () => {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Professional Profile - Dr. ${doctorInfo.username}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
          }
          h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
          }
          h2 {
            color: #1e40af;
            margin-top: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
          }
          .section {
            margin-bottom: 30px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 10px;
            margin-bottom: 15px;
          }
          .label {
            font-weight: bold;
            color: #6b7280;
          }
          .item {
            background: #f9fafb;
            padding: 15px;
            margin-bottom: 15px;
            border-left: 4px solid #2563eb;
          }
          .badge {
            display: inline-block;
            background: #dbeafe;
            color: #1e40af;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 14px;
            margin-right: 8px;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <h1>Dr. ${doctorInfo.username}</h1>
        
        <div class="section">
          <div class="info-grid">
            <div class="label">Specialty:</div>
            <div>${doctorInfo.specialty || 'Not specified'}</div>
            
            <div class="label">Registration:</div>
            <div>${profile.registrationNumber || 'Not specified'}</div>
            
            <div class="label">Clinic:</div>
            <div>${profile.clinicName || 'Not specified'}</div>
            
            ${profile.clinicWebsite ? `
              <div class="label">Website:</div>
              <div>${profile.clinicWebsite}</div>
            ` : ''}
            
            <div class="label">Consultation Fee:</div>
            <div>$${profile.consultationFee || 'Contact for pricing'}</div>
          </div>
        </div>

        ${profile.professionalBio ? `
          <div class="section">
            <h2>Professional Bio</h2>
            <p>${profile.professionalBio}</p>
          </div>
        ` : ''}

        ${profile.education && profile.education.length > 0 ? `
          <div class="section">
            <h2>Education</h2>
            ${profile.education.map((edu: any) => `
              <div class="item">
                <strong>${edu.degree}</strong> in ${edu.field || 'Medicine'}<br>
                ${edu.institution}, ${edu.year}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${profile.certifications && profile.certifications.length > 0 ? `
          <div class="section">
            <h2>Certifications</h2>
            ${profile.certifications.map((cert: any) => `
              <div class="item">
                <strong>${cert.name}</strong><br>
                ${cert.issuingOrganization}<br>
                Issued: ${new Date(cert.issueDate).toLocaleDateString()}
                ${cert.expiryDate ? ` | Expires: ${new Date(cert.expiryDate).toLocaleDateString()}` : ''}
                ${cert.credentialId ? `<br>Credential ID: ${cert.credentialId}` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${profile.publications && profile.publications.length > 0 ? `
          <div class="section">
            <h2>Publications</h2>
            ${profile.publications.map((pub: any) => `
              <div class="item">
                <strong>${pub.title}</strong><br>
                ${pub.journal}, ${pub.year}
                ${pub.doi ? `<br>DOI: ${pub.doi}` : ''}
                ${pub.url ? `<br>URL: ${pub.url}` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${profile.awards && profile.awards.length > 0 ? `
          <div class="section">
            <h2>Awards & Recognition</h2>
            ${profile.awards.map((award: any) => `
              <div class="item">
                <strong>${award.title}</strong><br>
                ${award.organization}, ${award.year}
                ${award.description ? `<br>${award.description}` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="footer">
          <p>This professional profile was generated from MedThread</p>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Dr_${doctorInfo.username}_Profile.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    // Show success message
    alert('Profile exported! You can open the HTML file in your browser and print to PDF.')
  }

  return (
    <button
      onClick={generatePDF}
      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
    >
      <Download className="w-4 h-4" />
      Export as PDF
    </button>
  )
}

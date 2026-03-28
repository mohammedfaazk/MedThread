'use client'
import { useState } from 'react'
import './DoctorIdentityCard3D.css'

interface DoctorIdentityCard3DProps {
  doctor: {
    id: string
    name?: string
    username?: string
    full_name?: string
    specialty?: string
    specialization?: string
    clinic_name?: string
    hospitalAffiliation?: string
    yearsOfExperience?: number
    years_experience?: number
    profile_photo?: string
    avatar?: string
    verification_status?: string
    role?: string
    medicalLicenseNumber?: string
    totalKarma?: number
  }
}

export function DoctorIdentityCard3D({ doctor }: DoctorIdentityCard3DProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  // Extract doctor data with fallbacks
  const displayName = doctor.name || doctor.username || doctor.full_name || 'Doctor'
  const specialty = doctor.specialty || doctor.specialization || 'Medical Professional'
  const clinicName = doctor.clinic_name || doctor.hospitalAffiliation || 'Medical Center'
  const experience = doctor.yearsOfExperience || doctor.years_experience || 0
  const profilePhoto = doctor.profile_photo || doctor.avatar
  const isVerified = doctor.verification_status === 'approved' || doctor.role === 'VERIFIED_DOCTOR'
  const karma = doctor.totalKarma || 0
  const licenseNumber = doctor.medicalLicenseNumber || 'Not Available'

  // Get initials for fallback avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div 
      className="doctor-card-3d-wrapper"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      role="img"
      aria-label={`Doctor profile card for ${displayName}, ${specialty} at ${clinicName}`}
    >
      <div className={`doctor-card-3d-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* Front Side - Basic Info */}
        <div className="doctor-card-3d-face doctor-card-3d-front">
          <div className="card-glow-effect"></div>
          <div className="card-scan-line"></div>
          
          <div className="card-header">
            <div className="avatar-section">
              {profilePhoto ? (
                <>
                  <img 
                    className="avatar-image" 
                    src={profilePhoto} 
                    alt={displayName}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                  <div className="avatar-initials" style={{ display: 'none' }}>
                    {getInitials(displayName)}
                  </div>
                </>
              ) : (
                <div className="avatar-initials">
                  {getInitials(displayName)}
                </div>
              )}
              <div className="avatar-ring"></div>
            </div>
            
            {isVerified && (
              <div className="verified-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                VERIFIED
              </div>
            )}
          </div>

          <div className="card-content-front">
            <h3 className="doctor-name">{displayName}</h3>
            <p className="doctor-specialty">{specialty}</p>
            <div className="info-divider"></div>
            <div className="hospital-info">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5m4 0H9"/>
              </svg>
              <span>{clinicName}</span>
            </div>
          </div>

          <div className="card-footer">
            <div className="hover-hint">Hover for details</div>
          </div>
        </div>

        {/* Back Side - Detailed Info */}
        <div className="doctor-card-3d-face doctor-card-3d-back">
          <div className="card-glow-effect"></div>
          
          <div className="card-content-back">
            <div className="detail-section">
              <div className="detail-label">Experience</div>
              <div className="detail-value">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                {experience} years
              </div>
            </div>

            <div className="detail-section">
              <div className="detail-label">Reputation Score</div>
              <div className="detail-value">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {karma} karma
              </div>
            </div>

            <div className="detail-section">
              <div className="detail-label">License Number</div>
              <div className="detail-value license-number">
                {licenseNumber}
              </div>
            </div>

            <div className="detail-section">
              <div className="detail-label">Status</div>
              <div className="detail-value status-active">
                <span className="status-dot"></span>
                Active & Available
              </div>
            </div>
          </div>

          <div className="card-footer-back">
            <div className="medthread-logo">MedThread · Medical ID</div>
          </div>
        </div>
      </div>
    </div>
  )
}

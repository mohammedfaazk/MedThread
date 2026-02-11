# MedThread Security & Compliance

## Security Architecture

### Defense in Depth Strategy

```
┌─────────────────────────────────────────┐
│  Layer 1: Network Security              │
│  - WAF, DDoS Protection, Firewall       │
├─────────────────────────────────────────┤
│  Layer 2: Application Security          │
│  - Input Validation, CSRF, XSS          │
├─────────────────────────────────────────┤
│  Layer 3: Authentication & Authorization│
│  - JWT, RBAC, MFA                       │
├─────────────────────────────────────────┤
│  Layer 4: Data Security                 │
│  - Encryption at Rest & Transit         │
├─────────────────────────────────────────┤
│  Layer 5: Monitoring & Logging          │
│  - Audit Logs, Intrusion Detection      │
└─────────────────────────────────────────┘
```

## Authentication & Authorization

### JWT Implementation
```typescript
// Token structure
{
  "userId": "user_id",
  "role": "PATIENT" | "VERIFIED_DOCTOR",
  "iat": 1234567890,
  "exp": 1234567890
}

// Token expiration: 7 days
// Refresh token: 30 days
```

### Role-Based Access Control (RBAC)

**Permissions Matrix:**

| Action | Patient | Doctor | Moderator | Admin |
|--------|---------|--------|-----------|-------|
| Create Post | ✅ | ✅ | ✅ | ✅ |
| Reply to Post | ✅ | ✅ | ✅ | ✅ |
| Flag Content | ✅ | ✅ | ✅ | ✅ |
| Delete Own Content | ✅ | ✅ | ✅ | ✅ |
| Delete Any Content | ❌ | ❌ | ✅ | ✅ |
| Verify Doctors | ❌ | ❌ | ❌ | ✅ |
| Access Admin Panel | ❌ | ❌ | ✅ | ✅ |
| View Analytics | ❌ | ✅ | ✅ | ✅ |

### Multi-Factor Authentication (MFA)
- Required for doctors
- Optional for patients
- TOTP-based (Google Authenticator)
- Backup codes provided

## Data Encryption

### At Rest
- **Database**: AES-256 encryption
- **File Storage**: S3 server-side encryption
- **Backups**: Encrypted with separate keys
- **Logs**: Encrypted and access-controlled

### In Transit
- **TLS 1.3** for all connections
- **HTTPS** enforced (HSTS enabled)
- **Certificate pinning** for mobile apps
- **Perfect forward secrecy**

### End-to-End Encryption
- Medical file uploads
- Private messages (future feature)
- Sensitive patient data

## Input Validation & Sanitization

### Server-Side Validation
```typescript
// Using Zod for schema validation
const createThreadSchema = z.object({
  symptoms: z.array(z.string()).min(1).max(20),
  description: z.string().min(10).max(5000),
  severity: z.enum(['LOW', 'MODERATE', 'HIGH', 'EMERGENCY'])
});
```

### XSS Prevention
- HTML sanitization (DOMPurify)
- Content Security Policy (CSP)
- Output encoding
- React's built-in XSS protection

### SQL Injection Prevention
- Parameterized queries (Prisma ORM)
- No raw SQL queries
- Input validation
- Least privilege database access

### CSRF Protection
- CSRF tokens for state-changing operations
- SameSite cookie attribute
- Origin validation

## Rate Limiting

### API Rate Limits
```
Unauthenticated: 100 requests/hour
Authenticated Patient: 1000 requests/hour
Authenticated Doctor: 5000 requests/hour
Admin: Unlimited
```

### Specific Endpoints
```
POST /api/threads: 10/hour per user
POST /api/replies: 50/hour per user
POST /api/auth/login: 5/15min per IP
POST /api/auth/register: 3/hour per IP
```

## Privacy & Anonymization

### Patient Anonymity
- Auto-generated usernames (patient_123)
- No real names required
- Optional profile information
- IP addresses hashed
- Location data generalized (city-level only)

### Data Minimization
- Collect only necessary data
- Regular data cleanup
- Automatic deletion of old data
- User-initiated data deletion

### Right to be Forgotten (GDPR)
```bash
# User requests deletion
1. User submits deletion request
2. Admin verifies identity
3. System anonymizes all posts/replies
4. Personal data deleted
5. Audit log retained (anonymized)
6. Confirmation email sent
```

## Compliance

### HIPAA Compliance

**Technical Safeguards:**
- ✅ Access controls
- ✅ Audit controls
- ✅ Integrity controls
- ✅ Transmission security

**Administrative Safeguards:**
- ✅ Security management process
- ✅ Workforce security
- ✅ Information access management
- ✅ Security awareness training

**Physical Safeguards:**
- ✅ Facility access controls
- ✅ Workstation security
- ✅ Device and media controls

**Note:** MedThread is HIPAA-ready but requires Business Associate Agreement (BAA) for covered entities.

### GDPR Compliance
- ✅ Lawful basis for processing
- ✅ Data subject rights
- ✅ Data protection by design
- ✅ Data breach notification (72 hours)
- ✅ Privacy policy
- ✅ Cookie consent
- ✅ Data portability

### CCPA Compliance (California)
- ✅ Right to know
- ✅ Right to delete
- ✅ Right to opt-out
- ✅ Non-discrimination

## Audit Logging

### Logged Events
```typescript
{
  timestamp: "2024-01-01T00:00:00Z",
  userId: "user_id",
  action: "DELETE_POST",
  resource: "thread_id",
  ipAddress: "hashed_ip",
  userAgent: "browser_info",
  result: "SUCCESS" | "FAILURE",
  metadata: {...}
}
```

### Retention
- Security logs: 1 year
- Audit logs: 7 years (compliance)
- Access logs: 90 days
- Error logs: 30 days

## Vulnerability Management

### Security Scanning
- **Dependency scanning**: Daily (Snyk, npm audit)
- **Code scanning**: Every commit (CodeQL)
- **Container scanning**: Every build (Trivy)
- **Infrastructure scanning**: Weekly (AWS Inspector)

### Penetration Testing
- Annual third-party penetration test
- Quarterly internal security assessment
- Bug bounty program (coming soon)

### Vulnerability Response
```
Critical (P0): Patch within 24 hours
High (P1): Patch within 7 days
Medium (P2): Patch within 30 days
Low (P3): Patch in next release
```

## Incident Response Plan

### Phase 1: Detection & Analysis
1. Security alert triggered
2. Incident response team notified
3. Initial assessment
4. Severity classification

### Phase 2: Containment
1. Isolate affected systems
2. Preserve evidence
3. Implement temporary fixes
4. Prevent further damage

### Phase 3: Eradication
1. Identify root cause
2. Remove threat
3. Patch vulnerabilities
4. Verify system integrity

### Phase 4: Recovery
1. Restore systems
2. Monitor for recurrence
3. Validate functionality
4. Resume normal operations

### Phase 5: Post-Incident
1. Document incident
2. Lessons learned
3. Update procedures
4. Notify affected users (if required)
5. Regulatory reporting (if required)

## Security Best Practices

### For Developers
- Never commit secrets
- Use environment variables
- Follow secure coding guidelines
- Regular security training
- Code review for security issues

### For Users
- Strong password requirements
- MFA encouraged
- Security awareness tips
- Phishing protection
- Account security settings

## Third-Party Security

### Vendor Assessment
- Security questionnaire
- SOC 2 compliance verification
- Data processing agreement
- Regular security reviews

### Approved Vendors
- AWS (Infrastructure)
- SendGrid (Email)
- Sentry (Error tracking)
- Stripe (Payments - future)

## Compliance Certifications (Roadmap)

- [ ] SOC 2 Type II
- [ ] ISO 27001
- [ ] HITRUST CSF
- [ ] PCI DSS (for payments)

## Security Contacts

**Report Security Issues:**
- Email: security@medthread.com
- PGP Key: [Link to public key]
- Response time: <24 hours

**Security Team:**
- CISO: [Name]
- Security Engineer: [Name]
- Compliance Officer: [Name]

## Regular Security Activities

**Daily:**
- Automated vulnerability scans
- Log monitoring
- Threat intelligence review

**Weekly:**
- Security metrics review
- Incident review
- Access review

**Monthly:**
- Security training
- Policy review
- Vendor assessment

**Quarterly:**
- Penetration testing
- Disaster recovery drill
- Compliance audit

**Annually:**
- Third-party security audit
- Policy updates
- Risk assessment

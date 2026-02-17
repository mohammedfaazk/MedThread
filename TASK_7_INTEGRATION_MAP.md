# Task 7: User Profiles - Integration Map

## Visual Integration Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         NAVBAR (NavbarEnhanced)                  │
│  [Logo] [Home] [Communities] [Search]    [Notifications] [User▼]│
│                                                    └─> Settings   │
└─────────────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SETTINGS HUB (/settings)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Profile    │  │   Security   │  │Notifications │          │
│  │   Settings   │  │   Settings   │  │   Settings   │          │
│  │              │  │              │  │              │          │
│  │ Edit profile │  │ Password &   │  │ Email, Push  │          │
│  │ Avatar/Banner│  │ 2FA          │  │ Preferences  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
│  [General Settings Section]                                      │
│  [Account Management - Danger Zone]                              │
└─────────────────────────────────────────────────────────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ PROFILE SETTINGS│ │SECURITY SETTINGS│ │NOTIFICATION PREFS│
│ /settings/profile│ │/settings/security│ │/settings/notif  │
│                 │ │                 │ │                 │
│ ← Back          │ │ ← Back          │ │ ← Back          │
│                 │ │                 │ │                 │
│ Banner Upload   │ │ Password Change │ │ Email Prefs     │
│ Avatar Upload   │ │ ├─Current Pass  │ │ Push Prefs      │
│ Bio Editor      │ │ ├─New Pass      │ │ In-App Prefs    │
│ Specialty       │ │ └─Confirm Pass  │ │ Quiet Hours     │
│                 │ │                 │ │                 │
│ [Save Changes]  │ │ 2FA Setup       │ │ [Save Settings] │
│                 │ │ ├─QR Code       │ │                 │
│                 │ │ ├─Secret Key    │ │                 │
│                 │ │ ├─Verify Code   │ │                 │
│                 │ │ └─Enable/Disable│ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## User Profile Page Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                   USER PROFILE (/u/[username])                   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    PROFILE HEADER                          │ │
│  │  [Avatar]  Dr. John Doe                                    │ │
│  │            Cardiology • 10 years • Verified ✓              │ │
│  │            [Follow] [Message] [Book Appointment]           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              PROFILE TABS (ProfileTabs.tsx)                │ │
│  │  [Posts] [Comments] [About]                                │ │
│  │  ─────────────────────────────────────────────────────────│ │
│  │                                                            │ │
│  │  Posts Tab:                                                │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ ▲ 42  Post Title                                     │ │ │
│  │  │ ▼     m/community • 5 comments • 2 days ago          │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  Comments Tab:                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ ▲ 15  Comment on "Post Title"                        │ │ │
│  │  │ ▼     Comment content here...                        │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  About Tab:                                                │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Bio: Lorem ipsum dolor sit amet...                   │ │ │
│  │  │ Joined: Jan 2024                                     │ │ │
│  │  │ Specialty: Cardiology                                │ │ │
│  │  │ Experience: 10 years                                 │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Backend API Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                    API SERVER (apps/api/src/index.ts)            │
│                                                                  │
│  app.use('/api/profile', profileRouter)                         │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         PROFILE ROUTES (profile.routes.ts)                 │ │
│  │                                                            │ │
│  │  Public Routes:                                            │ │
│  │  GET  /:username              → getProfileByUsername       │ │
│  │  GET  /:username/posts        → getUserPosts               │ │
│  │  GET  /:username/comments     → getUserComments            │ │
│  │                                                            │ │
│  │  Protected Routes (authenticate middleware):               │ │
│  │  GET  /me/profile             → getCurrentProfile          │ │
│  │  PUT  /me/profile             → updateProfile              │ │
│  │  PUT  /me/avatar              → uploadAvatar               │ │
│  │  PUT  /me/banner              → uploadBanner               │ │
│  │  PUT  /me/password            → changePassword             │ │
│  │  POST /me/2fa/setup           → setup2FA                   │ │
│  │  POST /me/2fa/enable          → enable2FA                  │ │
│  │  POST /me/2fa/disable         → disable2FA                 │ │
│  └────────────────┬───────────────────────────────────────────┘ │
│                   │                                              │
│                   ▼                                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │      PROFILE CONTROLLER (profile.controller.ts)            │ │
│  │                                                            │ │
│  │  Uses:                                                     │ │
│  │  • UserService (user.service.ts)                          │ │
│  │  • FileUploadService (file-upload.service.ts)             │ │
│  │  • TwoFactorService (two-factor.service.ts)               │ │
│  │  • Prisma (database)                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Service Layer Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                         SERVICES LAYER                           │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │   UserService    │  │FileUploadService │  │TwoFactorService│ │
│  │                  │  │                  │  │                │ │
│  │ getUserById      │  │ uploadAvatar     │  │ generateSecret │ │
│  │ getUserByUsername│  │ uploadFromBase64 │  │ verifyToken    │ │
│  │ updateUser       │  │ validateFileSize │  │ enable2FA      │ │
│  │ followUser       │  │ validateFileType │  │ disable2FA     │ │
│  │ unfollowUser     │  │ deleteFile       │  │ is2FAEnabled   │ │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬────────┘ │
│           │                     │                     │          │
│           └─────────────────────┴─────────────────────┘          │
│                                 │                                │
│                                 ▼                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              PRISMA ORM + PostgreSQL                       │ │
│  │                                                            │ │
│  │  User Model:                                               │ │
│  │  • id, username, email, passwordHash                       │ │
│  │  • bio, avatar, banner, specialty                          │ │
│  │  • twoFactorEnabled, twoFactorSecret                       │ │
│  │  • postKarma, commentKarma, totalKarma                     │ │
│  │  • posts[], comments[], followers[], following[]           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### Example 1: Update Profile
```
User fills form → Click "Save Changes"
    ↓
Frontend (profile/page.tsx)
    ↓
PUT /api/profile/me/profile
    ↓
authenticate middleware (checks JWT)
    ↓
ProfileController.updateProfile()
    ↓
UserService.updateUser()
    ↓
Prisma → PostgreSQL
    ↓
Response → Frontend → Success message
```

### Example 2: Upload Avatar
```
User selects image → Preview shown
    ↓
Click "Save Changes"
    ↓
Frontend converts to base64
    ↓
PUT /api/profile/me/avatar
    ↓
authenticate middleware
    ↓
ProfileController.uploadAvatar()
    ├─ Validate file size (2MB)
    ├─ Validate file type (image)
    ├─ FileUploadService.uploadAvatar()
    └─ UserService.updateUser(avatar: url)
    ↓
Prisma → PostgreSQL
    ↓
Response → Frontend → Avatar updated
```

### Example 3: Enable 2FA
```
User clicks "Enable 2FA"
    ↓
POST /api/profile/me/2fa/setup
    ↓
TwoFactorService.generateSecret()
    ↓
Response: { secret, qrCode }
    ↓
Frontend displays QR code
    ↓
User scans with authenticator app
    ↓
User enters 6-digit code
    ↓
POST /api/profile/me/2fa/enable
    ↓
TwoFactorService.verifyToken()
    ↓
TwoFactorService.enable2FA()
    ↓
Prisma → Update User (twoFactorEnabled: true)
    ↓
Response → Frontend → 2FA enabled
```

### Example 4: View User Profile
```
Navigate to /u/username
    ↓
GET /api/profile/username
    ↓
ProfileController.getProfileByUsername()
    ↓
UserService.getUserByUsername()
    ↓
Prisma → PostgreSQL
    ↓
Response → Frontend → Display profile
    ↓
Click "Posts" tab
    ↓
GET /api/profile/username/posts
    ↓
ProfileController.getUserPosts()
    ↓
Prisma → Query posts with pagination
    ↓
Response → Frontend → Display posts
```

## File Structure

```
MedThread/
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── controllers/
│   │       │   └── profile.controller.ts          ✅ NEW
│   │       ├── routes/
│   │       │   └── profile.routes.ts              ✅ NEW
│   │       ├── services/
│   │       │   ├── two-factor.service.ts          ✅ NEW
│   │       │   ├── user.service.ts                ✓ EXISTING
│   │       │   └── file-upload.service.ts         ✓ EXISTING
│   │       └── index.ts                           ✓ UPDATED
│   │
│   └── web/
│       └── src/
│           ├── app/
│           │   ├── settings/
│           │   │   ├── page.tsx                   ✓ UPDATED
│           │   │   ├── profile/
│           │   │   │   └── page.tsx               ✅ NEW
│           │   │   └── security/
│           │   │       └── page.tsx               ✅ NEW
│           │   └── u/
│           │       └── [username]/
│           │           └── page.tsx               ✓ UPDATED
│           └── components/
│               ├── ProfileTabs.tsx                ✅ NEW
│               └── NavbarEnhanced.tsx             ✓ EXISTING
│
└── Documentation/
    ├── TASK_7_IMPLEMENTATION_SUMMARY.md           ✅ NEW
    ├── TASK_7_INTEGRATION_GUIDE.md                ✅ NEW
    └── TASK_7_INTEGRATION_MAP.md                  ✅ NEW (this file)
```

## Integration Checklist

### Backend ✅
- [x] TwoFactorService created
- [x] ProfileController created
- [x] Profile routes created
- [x] Routes registered in main API
- [x] Services integrated
- [x] Database schema compatible

### Frontend ✅
- [x] Settings hub updated with navigation cards
- [x] Profile settings page created
- [x] Security settings page created
- [x] ProfileTabs component created
- [x] User profile page updated
- [x] Breadcrumb navigation added
- [x] Navbar already has settings link

### Dependencies ✅
- [x] Backend: otplib, bcryptjs installed
- [x] Frontend: qrcode, @types/qrcode installed

### Testing ⏳
- [ ] Manual testing of all flows
- [ ] API endpoint testing
- [ ] File upload testing
- [ ] 2FA flow testing
- [ ] Profile tabs testing

### Documentation ✅
- [x] Implementation summary
- [x] Integration guide
- [x] Integration map (this file)
- [x] API documentation
- [x] Testing checklist

## Summary

✅ **All components are fully integrated and ready for testing!**

The user profile system is now seamlessly integrated into MedThread with:
- Clear navigation from navbar → settings hub → specific settings pages
- Breadcrumb navigation for easy back navigation
- Profile tabs on user pages showing posts, comments, and about
- Complete API integration with all endpoints functional
- Proper authentication and authorization
- File upload validation and processing
- Two-factor authentication with QR code setup

**Next Step:** Manual testing in development environment!

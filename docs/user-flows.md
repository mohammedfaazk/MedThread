# MedThread User Flows

## 1. Patient Journey - First Time User

### Flow: Sign Up → Create First Post → Receive Response

```
1. Landing Page
   ↓
2. Click "Get Started"
   ↓
3. Sign Up Form
   - Email
   - Username (auto-generated, editable)
   - Password
   - Role: Patient
   ↓
4. Email Verification
   ↓
5. Onboarding Tutorial (3 screens)
   - "Share your symptoms"
   - "Get verified doctor responses"
   - "Track your health journey"
   ↓
6. Dashboard (Empty State)
   - "Create your first post"
   - Browse existing discussions
   ↓
7. Create Post Flow
   Step 1: Basic Info
   - Age, Gender, Weight
   - Existing conditions
   - Current medications
   ↓
   Step 2: Symptoms
   - Select from common symptoms
   - Duration slider
   - Severity selector
   ↓
   Step 3: Details
   - Detailed description
   - Upload medical files (optional)
   - AI analysis shown in sidebar
   ↓
8. Review & Publish
   - Preview post
   - Confirm anonymity settings
   - Publish
   ↓
9. Post Published
   - Success message
   - "Doctors will be notified"
   - View your post
   ↓
10. Notification: Doctor Responded
    - Email notification
    - In-app notification
    ↓
11. View Doctor Response
    - Read advice
    - Mark as helpful
    - Ask follow-up question
    ↓
12. Case Timeline Updated
    - Track progress
    - Add recovery logs
```

## 2. Doctor Journey - First Time User

### Flow: Sign Up → Verification → Answer First Question

```
1. Landing Page
   ↓
2. Click "Join as Doctor"
   ↓
3. Doctor Sign Up Form
   - Email
   - Full Name
   - Medical License Number
   - Specialty
   - Password
   ↓
4. Verification Document Upload
   - Medical license (PDF/Image)
   - Professional ID
   - NPI number
   - Liability insurance proof
   ↓
5. Verification Pending Screen
   - "We're reviewing your application"
   - "Typically takes 24-48 hours"
   - Email notification when approved
   ↓
6. Verification Approved Email
   - "Welcome to MedThread!"
   - Login to start helping patients
   ↓
7. Doctor Dashboard
   - Recent questions in your specialty
   - Trending discussions
   - Your reputation score: 0
   ↓
8. Browse Questions
   - Filter by specialty
   - Filter by severity
   - Sort by recent/unanswered
   ↓
9. Select Question to Answer
   - Read patient symptoms
   - View AI analysis
   - Check similar cases
   ↓
10. Write Response
    - Structured response editor
    - Add clinical recommendations
    - Cite sources (optional)
    - Preview
    ↓
11. Publish Response
    - Response posted
    - Patient notified
    - Reputation +5 points
    ↓
12. Patient Marks Helpful
    - Notification: "Patient found your answer helpful"
    - Reputation +5 points
    - Total: 10 points
```

## 3. Patient Journey - Emergency Detection

### Flow: Create Post → AI Detects Emergency → Escalation

```
1. Create Post
   ↓
2. Enter Symptoms
   - "Chest pain"
   - "Shortness of breath"
   - "Left arm numbness"
   ↓
3. AI Analysis (Real-time)
   - Emergency pattern detected
   - Confidence: 95%
   ↓
4. Emergency Warning Banner
   - 🚨 "Your symptoms may indicate a medical emergency"
   - "Please seek immediate medical attention"
   - [Call Emergency Services]
   - [Find Nearest Hospital]
   ↓
5. User Options
   Option A: Call Emergency Services
   - Direct link to emergency number
   - Location shared
   
   Option B: Find Hospital
   - Map with nearest hospitals
   - Directions
   
   Option C: Continue Posting
   - Post marked as EMERGENCY
   - Doctors notified immediately
   - Admin alerted
   ↓
6. Emergency Post Published
   - Pinned to top of feed
   - Red border/badge
   - Doctors receive urgent notification
   ↓
7. Rapid Doctor Response
   - Multiple doctors respond quickly
   - Responses prioritized
   - Follow-up tracking
```

## 4. Doctor Journey - Build Reputation

### Flow: Consistent Engagement → Reputation Growth → Benefits

```
1. Regular Activity
   - Answer 5 questions/week
   - Provide detailed responses
   - Cite medical sources
   ↓
2. Patient Feedback
   - Patients mark answers helpful
   - 4.8/5 average rating
   - Positive comments
   ↓
3. Reputation Milestones
   - 100 points: Active Contributor badge
   - 500 points: Trusted Professional badge
   - 1000 points: Expert badge
   ↓
4. Unlocked Benefits
   - Featured on homepage
   - Priority in search results
   - Access to analytics dashboard
   - Telemedicine booking enabled
   ↓
5. Peer Recognition
   - Other doctors upvote answers
   - Invited to peer review
   - Collaboration opportunities
   ↓
6. Monetization Opportunities
   - Patients book consultations
   - Premium profile features
   - Hospital partnership invites
```

## 5. Moderation Flow - Flagged Content

### Flow: User Reports → Review → Action

```
1. User Sees Inappropriate Content
   ↓
2. Click "Report"
   ↓
3. Select Report Reason
   - Misinformation
   - Inappropriate content
   - Spam
   - Impersonation
   - Emergency
   ↓
4. Add Details (Optional)
   - Explain the issue
   - Provide context
   ↓
5. Report Submitted
   - "Thank you for reporting"
   - "We'll review within 24 hours"
   ↓
6. Moderator Review Queue
   - AI pre-screening
   - Priority: Emergency > Misinformation > Other
   ↓
7. Moderator Decision
   Option A: Valid Report
   - Remove content
   - Warn user
   - Update reputation
   - Notify reporter
   
   Option B: Invalid Report
   - Keep content
   - Notify reporter
   - Log decision
   ↓
8. Appeal Process (if applicable)
   - User can appeal
   - Senior moderator review
   - Final decision
```

## 6. Patient Journey - Case Timeline

### Flow: Initial Post → Updates → Resolution

```
1. Create Initial Post
   - Symptoms: Headache, fever
   - Severity: Moderate
   ↓
2. Timeline Event: Symptom Start
   - Logged automatically
   - Date: Day 1
   ↓
3. Doctor Responds
   - Advice: Rest, hydration, monitor
   - Timeline Event: Doctor Advice
   - Date: Day 1
   ↓
4. Patient Update
   - "Feeling slightly better"
   - Timeline Event: Recovery Log
   - Date: Day 3
   ↓
5. Test Results
   - Upload lab results
   - Timeline Event: Test Results
   - Date: Day 5
   ↓
6. Medication Update
   - Started antibiotics
   - Timeline Event: Medication Update
   - Date: Day 6
   ↓
7. Final Update
   - "Fully recovered"
   - Timeline Event: Recovery Log
   - Date: Day 10
   - Mark thread as resolved
   ↓
8. Timeline Visualization
   - Vertical timeline view
   - All events chronologically
   - Shareable with doctor
```

## 7. Search & Discovery Flow

### Flow: User Searches → Filters → Finds Relevant Thread

```
1. Dashboard
   ↓
2. Enter Search Query
   - "migraine headache"
   ↓
3. Search Results
   - Ranked by relevance
   - Show snippet
   - Highlight keywords
   ↓
4. Apply Filters
   - Severity: All
   - Has Doctor Response: Yes
   - Date: Last 30 days
   - Category: Neurology
   ↓
5. Refined Results
   - 15 relevant threads
   - Sorted by relevance
   ↓
6. Click Thread
   - Read full discussion
   - View doctor responses
   - Similar threads suggested
   ↓
7. Engage
   - Upvote helpful responses
   - Add own experience
   - Follow thread
```

## 8. Mobile User Flow - Quick Post

### Flow: Mobile User → Quick Symptom Post → Response

```
1. Open Mobile App
   ↓
2. Tap Floating "+" Button
   ↓
3. Quick Post Mode
   - Voice input option
   - Camera for symptoms
   - Simplified form
   ↓
4. Speak Symptoms
   - "I have a severe headache and nausea"
   - AI transcribes and analyzes
   ↓
5. Confirm Details
   - Review transcription
   - Add severity
   - Tap "Post"
   ↓
6. Posted
   - Push notification enabled
   - Return to feed
   ↓
7. Push Notification
   - "Dr. Smith responded to your post"
   ↓
8. Tap Notification
   - Opens thread
   - Read response
   - Quick reply option
```

## 9. Doctor Verification Flow - Admin Side

### Flow: Application Received → Review → Decision

```
1. New Verification Request
   - Admin dashboard alert
   - Queue: 5 pending
   ↓
2. Open Application
   - Doctor name
   - License number
   - Specialty
   - Documents attached
   ↓
3. Verify Documents
   - Check license validity (external DB)
   - Verify NPI number
   - Review credentials
   ↓
4. Background Check
   - Disciplinary records
   - Malpractice history
   - Professional standing
   ↓
5. Decision
   Option A: Approve
   - Activate account
   - Send approval email
   - Add verification badge
   - Log decision
   
   Option B: Reject
   - Send rejection email
   - Provide reason
   - Allow reapplication
   - Log decision
   ↓
6. Post-Approval
   - Doctor added to directory
   - Specialty tagged
   - Reputation initialized
   - Welcome email sent
```

## 10. Notification Preferences Flow

### Flow: User → Settings → Customize Notifications

```
1. User Profile
   ↓
2. Click "Settings"
   ↓
3. Notification Settings
   ↓
4. Configure Channels
   - Email: On/Off
   - Push: On/Off
   - SMS: On/Off (emergency only)
   ↓
5. Configure Types
   - Replies to my posts: On
   - Doctor responses: On
   - Follow-up reminders: Off
   - Emergency alerts: On (cannot disable)
   - Reputation milestones: On
   - Weekly digest: On
   ↓
6. Quiet Hours
   - Start: 10:00 PM
   - End: 8:00 AM
   - Emergency alerts override
   ↓
7. Save Preferences
   - "Settings saved"
   - Test notification option
```

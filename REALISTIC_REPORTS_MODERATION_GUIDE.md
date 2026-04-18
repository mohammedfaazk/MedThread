# Realistic Reports & Moderation Data Guide

## Overview
This guide explains how to populate your admin dashboard with realistic mock data for the **Report & Moderation Activity** graph.

## What Gets Created

### 📊 Reports (12 weeks of data)
- **Total Reports**: 120-300 realistic reports across 12 weeks
- **Report Types**:
  - Spam & Promotional Content
  - Harassment & Bullying
  - Medical Misinformation
  - Inappropriate Content
  - Privacy Violations

### 📈 Moderation Activity Graph Data
- **Filed Reports**: 10-25 per week (more in recent weeks)
- **Resolved Reports**: ~70% of older reports, ~40% of recent reports
- **Dismissed Reports**: ~20% of older reports, ~30% of recent reports
- **Pending Reports**: ~10% of older reports, ~30% of recent reports

### 🤖 AI Content Moderation Records
- **50 AI moderation records** with realistic toxicity scores
- **Categories**:
  - 70% approved (safe content, toxicity 0-0.3)
  - 20% flagged for review (medium toxicity 0.3-0.6)
  - 10% removed (high toxicity 0.6-1.0)

## Realistic Patterns

### Report Distribution
- **Patients**: 70% of reports (more likely to report issues)
- **Doctors**: 30% of reports
- **Posts**: 60% of reports target posts
- **Comments**: 40% of reports target comments

### Time-Based Patterns
- More reports in recent weeks (realistic activity spike)
- Older reports are more likely to be resolved
- Recent reports have more pending status

### Report Reasons (Realistic Categories)

#### 1. Spam (25%)
- Promotional Content
- Repetitive Posting
- Advertisement
- Unsolicited commercial content

#### 2. Harassment (20%)
- Personal attacks
- Bullying behavior
- Threatening language
- Targeted harassment

#### 3. Medical Misinformation (25%)
- False health claims
- Dangerous medical advice
- Unproven treatments
- Contradicts medical guidelines

#### 4. Inappropriate Content (20%)
- Off-topic posts
- Explicit content
- Guideline violations
- Disrespectful discourse

#### 5. Privacy Violations (10%)
- Sharing personal information
- Doxxing attempts
- Confidential patient data
- Privacy breaches

## How to Run

### Prerequisites
Make sure you have:
1. Existing users (doctors and patients) in your database
2. Existing posts and comments
3. Run the comprehensive seed first if needed

### Run the Seed Script

```bash
# Navigate to the API directory
cd apps/api

# Run the realistic reports & moderation seed
npm run seed:reports
```

Or using turbo from the root:

```bash
turbo run seed:reports --filter=@medthread/api
```

### Expected Output

```
🛡️ Starting realistic reports and moderation data seeding...

✅ Found 20 doctors and 50 patients

✅ Found 100 posts and 200 comments

📝 Creating realistic reports over the past 12 weeks...

   ✅ Week 12: 15 filed, 12 resolved, 3 dismissed
   ✅ Week 11: 18 filed, 14 resolved, 4 dismissed
   ✅ Week 10: 12 filed, 9 resolved, 3 dismissed
   ...

✅ Created 180 realistic reports

📊 Updating moderation activity data...

✅ Updated 12 weeks of moderation activity data

🤖 Creating AI content moderation records...

✅ Created 50 AI moderation records

✨ ========================================
✨ REALISTIC REPORTS & MODERATION COMPLETE!
✨ ========================================

📊 SUMMARY:
   ✅ Total Reports Created: 180
   ✅ Moderation Activity: 12 weeks of data
   ✅ AI Moderation Records: 50

📈 REPORT BREAKDOWN:
   • PENDING: 45 reports
   • APPROVED: 90 reports
   • REJECTED: 45 reports

🎯 REPORT CATEGORIES:
   • Spam: Multiple variations
   • Harassment: Multiple variations
   • Misinformation: Multiple variations
   • Inappropriate: Multiple variations
   • Privacy: Multiple variations

🎉 Admin dashboard now has realistic moderation data!
🎉 View at: http://localhost:3000/admin/analytics
```

## View the Results

### Admin Analytics Dashboard
Navigate to: `http://localhost:3000/admin/analytics`

Look for the **Report & Moderation Activity** graph showing:
- 📊 Filed reports (orange line)
- ✅ Resolved reports (green line)
- ❌ Dismissed reports (red line)

### Admin Reports Page
Navigate to: `http://localhost:3000/admin/reports`

You'll see:
- List of all reports with status filters
- Report details with reason and description
- Ability to approve/reject reports

### Admin Moderation Dashboard
Navigate to: `http://localhost:3000/admin/moderation`

You'll see:
- AI-flagged content with toxicity scores
- Content moderation queue
- Action buttons for moderation

## Data Characteristics

### Realistic Patterns
✅ **Time-based decay**: Older reports are more likely resolved  
✅ **Activity spikes**: Recent weeks have more activity  
✅ **Varied reasons**: Multiple report categories with realistic descriptions  
✅ **User behavior**: Patients report more than doctors  
✅ **Content mix**: Both posts and comments are reported  
✅ **Status distribution**: Realistic pending/resolved/dismissed ratios  

### Graph Visualization
The moderation activity graph will show:
- Smooth trends over 12 weeks
- Realistic filed/resolved/dismissed ratios
- More activity in recent weeks
- Professional-looking data for presentations

## Troubleshooting

### "Not enough users" error
Run the comprehensive seed first:
```bash
cd apps/api
npm run seed:comprehensive
```

### "No posts or comments found"
Make sure you have content in your database. Run:
```bash
cd packages/database
npm run seed
```

### Duplicate reports
The script automatically skips duplicates, so you may see slightly fewer reports than expected.

## Re-running the Script

You can safely re-run the script multiple times. It will:
- ✅ Clear existing moderation activity data
- ✅ Create new reports (skipping duplicates)
- ✅ Generate fresh moderation records

## Integration with Other Features

This seed data integrates with:
- 📊 Admin Analytics Dashboard
- 🛡️ Content Moderation System
- 📝 Report Management Interface
- 🤖 AI Toxicity Detection
- 👥 User Activity Tracking

## Next Steps

After seeding, you can:
1. View the admin analytics dashboard
2. Test the report management workflow
3. Review AI moderation decisions
4. Present the data in demos
5. Use it for testing moderation features

---

**Created**: April 2026  
**Purpose**: Realistic mock data for admin dashboard presentations and testing

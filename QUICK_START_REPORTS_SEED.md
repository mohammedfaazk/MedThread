# Quick Start: Realistic Reports & Moderation Data

## 🚀 One Command Setup

```bash
cd apps/api && npm run seed:reports
```

## 📊 What You Get

- **180+ realistic reports** across 12 weeks
- **5 report categories**: Spam, Harassment, Misinformation, Inappropriate, Privacy
- **3 status types**: Pending, Approved (Resolved), Rejected (Dismissed)
- **50 AI moderation records** with toxicity scores
- **Realistic patterns**: More recent activity, varied user behavior

## 📈 View Results

| Dashboard | URL |
|-----------|-----|
| Analytics (Main Graph) | `http://localhost:3000/admin/analytics` |
| Reports Management | `http://localhost:3000/admin/reports` |
| Moderation Queue | `http://localhost:3000/admin/moderation` |

## 🎯 Graph Data

The **Report & Moderation Activity** graph will show:
- 📊 **Filed** (orange): 10-25 reports per week
- ✅ **Resolved** (green): ~70% of filed reports
- ❌ **Dismissed** (red): ~20-30% of filed reports

## 💡 Report Examples

### Spam Reports
- "This post contains promotional links and advertisements"
- "User is repeatedly posting the same content"

### Harassment Reports
- "This comment contains personal attacks against another user"
- "Threatening language directed at community members"

### Misinformation Reports
- "This post contains medically inaccurate information"
- "Promoting unproven treatments as cures"

### Inappropriate Content
- "Content is not appropriate for a medical community"
- "Post is completely off-topic and unrelated to health"

### Privacy Violations
- "User is sharing private medical information without consent"
- "Post contains personally identifiable information"

## ⚡ Quick Facts

- **70%** of reports from patients
- **30%** of reports from doctors
- **60%** target posts
- **40%** target comments
- **Recent weeks** have more activity (realistic spike)
- **Older reports** more likely resolved

## 🔄 Re-run Anytime

Safe to run multiple times - automatically handles duplicates!

---

**Need more details?** See `REALISTIC_REPORTS_MODERATION_GUIDE.md`

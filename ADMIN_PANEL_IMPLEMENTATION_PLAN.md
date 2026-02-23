# Admin Panel - Complete Implementation Plan

## ✅ What's Already Done

1. ✅ Database schema updated with AuditLog model
2. ✅ Audit log service created
3. ✅ Admin service exists (`apps/api/src/services/admin.service.ts`)
4. ✅ Admin middleware exists (`apps/api/src/middleware/requireAdmin.ts`)
5. ✅ Doctor verification panel works

## 📋 What Needs to Be Implemented

### 1. Backend API Routes (Priority: HIGH)

#### User Management Routes
- `GET /api/admin/users` - List all users with filters
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id/suspend` - Suspend user
- `PUT /api/admin/users/:id/unsuspend` - Unsuspend user
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/users/:id/role` - Change user role

#### Post Moderation Routes
- `GET /api/admin/posts` - List all posts with filters
- `DELETE /api/admin/posts/:id` - Delete post
- `PUT /api/admin/posts/:id/restore` - Restore deleted post
- `PUT /api/admin/posts/:id/pin` - Pin post
- `PUT /api/admin/posts/:id/lock` - Lock post

#### Comment Moderation Routes
- `GET /api/admin/comments` - List all comments with filters
- `DELETE /api/admin/comments/:id` - Delete comment
- `PUT /api/admin/comments/:id/restore` - Restore deleted comment

#### Report Handling Routes
- `GET /api/admin/reports` - List all reports
- `GET /api/admin/reports/:id` - Get report details
- `PUT /api/admin/reports/:id/resolve` - Resolve report
- `PUT /api/admin/reports/:id/dismiss` - Dismiss report

#### Analytics Routes
- `GET /api/admin/analytics/overview` - Platform overview stats
- `GET /api/admin/analytics/users` - User analytics
- `GET /api/admin/analytics/content` - Content analytics
- `GET /api/admin/analytics/engagement` - Engagement metrics

#### Audit Log Routes
- `GET /api/admin/audit-logs` - List audit logs
- `GET /api/admin/audit-logs/stats` - Audit log statistics

### 2. Frontend Admin Panel Pages (Priority: HIGH)

#### Dashboard (`/admin`)
- Overview statistics
- Recent activity
- Quick actions
- Charts and graphs

#### User Management (`/admin/users`)
- User list with search/filter
- User details modal
- Suspend/unsuspend actions
- Delete user confirmation
- Role change

#### Post Moderation (`/admin/posts`)
- Post list with filters
- Post preview
- Delete/restore actions
- Pin/lock features

#### Comment Moderation (`/admin/comments`)
- Comment list with filters
- Comment context view
- Delete/restore actions

#### Report Management (`/admin/reports`)
- Report queue
- Report details
- Resolve/dismiss actions
- Report statistics

#### Analytics Dashboard (`/admin/analytics`)
- User growth charts
- Content statistics
- Engagement metrics
- Export data

#### Audit Logs (`/admin/audit-logs`)
- Log viewer with filters
- Admin activity tracking
- Export logs

### 3. Components Needed (Priority: MEDIUM)

- `AdminLayout.tsx` - Admin panel layout
- `AdminSidebar.tsx` - Navigation sidebar
- `UserTable.tsx` - User list table
- `PostTable.tsx` - Post list table
- `CommentTable.tsx` - Comment list table
- `ReportCard.tsx` - Report display card
- `AnalyticsChart.tsx` - Chart component
- `AuditLogTable.tsx` - Audit log table
- `ConfirmDialog.tsx` - Confirmation modal
- `FilterPanel.tsx` - Filter sidebar

### 4. Middleware & Utilities (Priority: HIGH)

- ✅ `requireAdmin.ts` - Already exists
- `auditLogger.ts` - Middleware to log admin actions
- `adminAuth.ts` - Enhanced admin authentication

## 📝 Implementation Steps

### Phase 1: Backend Foundation (Day 1-2)

1. Run Prisma migration to add AuditLog table
2. Update admin service with all CRUD operations
3. Create admin routes file
4. Add audit logging middleware
5. Test all API endpoints

### Phase 2: Frontend Foundation (Day 3-4)

1. Create admin layout and navigation
2. Build dashboard page with stats
3. Create reusable table components
4. Add filter and search functionality

### Phase 3: User Management (Day 5)

1. Build user management page
2. Add suspend/unsuspend functionality
3. Implement user deletion
4. Add role management

### Phase 4: Content Moderation (Day 6-7)

1. Build post moderation page
2. Build comment moderation page
3. Add delete/restore functionality
4. Implement pin/lock features

### Phase 5: Report System (Day 8)

1. Build report management page
2. Add resolve/dismiss functionality
3. Show report statistics

### Phase 6: Analytics (Day 9-10)

1. Build analytics dashboard
2. Add charts and graphs
3. Implement data export

### Phase 7: Audit Logs (Day 11)

1. Build audit log viewer
2. Add filtering and search
3. Implement log export

### Phase 8: Testing & Polish (Day 12-14)

1. Test all features
2. Fix bugs
3. Add loading states
4. Improve UI/UX
5. Add documentation

## 🚀 Quick Start Implementation

Since this is a large task, I recommend implementing in this order:

1. **Start with Audit Logging** (Most Important)
   - Update auth controller to log admin logins
   - Add audit logging to existing admin actions

2. **User Management** (High Priority)
   - Most commonly used admin feature
   - Build the UI and connect to existing API

3. **Report Handling** (High Priority)
   - Critical for moderation
   - Build report queue and resolution

4. **Analytics Dashboard** (Medium Priority)
   - Useful but not critical
   - Can use existing stats

5. **Post/Comment Moderation** (Medium Priority)
   - Extend existing functionality
   - Add admin-specific features

## 📦 Files to Create

### Backend (15 files)
1. `apps/api/src/routes/admin.routes.ts`
2. `apps/api/src/controllers/admin.controller.ts`
3. `apps/api/src/services/audit-log.service.ts` ✅ Done
4. `apps/api/src/services/analytics.service.ts`
5. `apps/api/src/middleware/auditLogger.ts`
6. Update existing services with audit logging

### Frontend (20+ files)
1. `apps/web/src/app/admin/layout.tsx`
2. `apps/web/src/app/admin/page.tsx` ✅ Exists
3. `apps/web/src/app/admin/users/page.tsx` ✅ Exists
4. `apps/web/src/app/admin/posts/page.tsx` ✅ Exists
5. `apps/web/src/app/admin/comments/page.tsx` ✅ Exists
6. `apps/web/src/app/admin/reports/page.tsx` ✅ Exists
7. `apps/web/src/app/admin/analytics/page.tsx`
8. `apps/web/src/app/admin/audit-logs/page.tsx` ✅ Exists
9. `apps/web/src/components/Admin/AdminLayout.tsx`
10. `apps/web/src/components/Admin/AdminSidebar.tsx`
11. `apps/web/src/components/Admin/UserTable.tsx`
12. `apps/web/src/components/Admin/PostTable.tsx`
13. `apps/web/src/components/Admin/CommentTable.tsx`
14. `apps/web/src/components/Admin/ReportCard.tsx`
15. `apps/web/src/components/Admin/AnalyticsChart.tsx`
16. `apps/web/src/components/Admin/AuditLogTable.tsx`
17. `apps/web/src/lib/adminApi.ts`

## 🔧 Database Migration

Run this to add AuditLog table:

```bash
cd packages/database
npx prisma migrate dev --name add-audit-logs
npx prisma generate
```

## 📊 Estimated Time

- **Backend**: 20-30 hours
- **Frontend**: 40-50 hours
- **Testing**: 10-15 hours
- **Total**: 70-95 hours (2-3 weeks full-time)

## 💡 Recommendation

Given the scope, I suggest:

1. **Option A**: Implement incrementally
   - Start with audit logging (2-3 hours)
   - Add user management (8-10 hours)
   - Add report handling (6-8 hours)
   - Continue with other features

2. **Option B**: Use existing admin pages
   - Update existing pages in `/admin/*`
   - Add missing functionality
   - Connect to backend APIs

3. **Option C**: Hire additional developer
   - This is 2-3 weeks of work
   - Better to have dedicated resource

## 🎯 Next Steps

Would you like me to:

1. Implement audit logging first (track admin logins and actions)?
2. Build the user management page completely?
3. Create the analytics dashboard?
4. Focus on report handling system?

Let me know which feature is most critical and I'll implement it fully!

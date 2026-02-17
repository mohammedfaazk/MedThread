# Avatar & Banner Display Fix

## Issues Fixed

### 1. Avatar Upload Error (400 Bad Request)
**Problem:** When saving profile without changing avatar/banner, the system tried to upload the existing image URL, which failed validation.

**Error Message:** 
```
PUT http://localhost:3001/api/profile/me/avatar 400 (Bad Request)
Error: Only JPEG, PNG, and WebP images are allowed
```

**Root Cause:** 
- When loading existing avatar/banner, `getImageUrl()` returns a full URL (e.g., `http://localhost:3001/uploads/...`)
- The upload functions were trying to send this URL to the backend
- Backend validation expects base64 data URLs (starting with `data:image/`)
- Full URLs don't match the validation pattern and get rejected

**Solution:**
Updated `uploadAvatar()` and `uploadBanner()` functions to:
1. Check if the preview is a new base64 image (`startsWith('data:image')`)
2. Skip upload if it's just the existing image URL
3. Only upload when user actually selects a new image

```typescript
const uploadAvatar = async () => {
  // Only upload if avatarPreview is a new base64 image
  if (!avatarPreview || !avatarPreview.startsWith('data:image')) return
  
  // Don't upload if it's the same as existing
  const existingAvatarUrl = getImageUrl(profile?.avatar)
  if (avatarPreview === existingAvatarUrl) return
  
  // ... upload logic
}
```

### 2. Avatar Not Showing in Navbar
**Problem:** After updating profile, the navbar still showed initials instead of the actual avatar.

**Root Cause:**
- User data in localStorage wasn't being updated after profile changes
- Navbar reads from the user context, which loads from localStorage
- No mechanism to refresh the navbar after profile updates

**Solution:**
1. Update localStorage with new user data after successful profile save
2. Dispatch storage event to trigger context refresh
3. Reload page to ensure all components reflect changes

```typescript
// Update user in localStorage with new data
const updatedUser = {
  ...user,
  username: response.data.data.username || user?.username,
  bio: response.data.data.bio,
  avatar: newAvatar || response.data.data.avatar || user?.avatar,
  banner: newBanner || response.data.data.banner || user?.banner,
}
localStorage.setItem('user', JSON.stringify(updatedUser))

// Trigger storage event and reload
window.dispatchEvent(new Event('storage'))
window.location.reload()
```

### 3. Banner Not Displayed on Profile Page
**Problem:** User profile page didn't show the banner image at all.

**Root Cause:**
- Profile page layout didn't include a banner section
- Only showed avatar and user info

**Solution:**
Redesigned profile page layout to include:
1. Full-width banner at the top (200px height)
2. Avatar overlapping the banner (-mt-20 for overlap effect)
3. Fallback gradient if no banner is set
4. Proper border and shadow styling

```typescript
{/* Banner */}
{profileUser.banner ? (
  <div className="h-48 w-full relative">
    <img src={getImageUrl(profileUser.banner)} className="w-full h-full object-cover" />
  </div>
) : (
  <div className="h-48 w-full bg-gradient-to-r from-blue-400 to-purple-500" />
)}

{/* Avatar with overlap */}
<div className="flex items-start gap-6 -mt-20">
  <img className="w-32 h-32 rounded-full border-4 border-white" />
  {/* ... rest of profile */}
</div>
```

## Files Modified

1. **apps/web/src/app/settings/profile/page.tsx**
   - Fixed `uploadAvatar()` to check for base64 data URLs
   - Fixed `uploadBanner()` to check for base64 data URLs
   - Updated `handleSubmit()` to update localStorage and reload page
   - Added proper error handling

2. **apps/web/src/app/u/[username]/page.tsx**
   - Added banner display section at top of profile
   - Repositioned avatar to overlap banner
   - Added bio display below user info
   - Improved layout and styling

## Testing Steps

### Test Avatar Upload
1. Go to `/settings/profile`
2. Click "Upload Avatar" and select an image
3. Click "Save Changes"
4. ✅ Should save successfully without errors
5. ✅ Page should reload
6. ✅ Navbar should show new avatar
7. ✅ Profile page should show new avatar

### Test Banner Upload
1. Go to `/settings/profile`
2. Click on banner area and select an image
3. Click "Save Changes"
4. ✅ Should save successfully
5. ✅ Navigate to your profile (`/u/your_username`)
6. ✅ Banner should display at top of profile

### Test Save Without Image Changes
1. Go to `/settings/profile`
2. Change only bio or username
3. Don't upload new images
4. Click "Save Changes"
5. ✅ Should save successfully without upload errors
6. ✅ Existing avatar/banner should remain unchanged

### Test Profile Display
1. Navigate to any user profile (`/u/username`)
2. ✅ Banner should display at top (or gradient if none)
3. ✅ Avatar should overlap banner
4. ✅ Bio should display if set
5. ✅ All user info should be visible

## Technical Details

### Image Upload Flow
1. User selects image file
2. FileReader converts to base64 data URL
3. Preview shows the base64 image
4. On save, check if preview is base64 (`data:image/...`)
5. If yes, upload to backend
6. Backend validates and saves to disk
7. Returns file path
8. Update user record with new path

### Image Display Flow
1. User data contains relative path (e.g., `/uploads/avatars/123.png`)
2. `getImageUrl()` converts to full URL
3. Component displays using full URL
4. Browser loads image from server

### Data Synchronization
1. Profile update saves to database
2. Response contains updated user data
3. Update localStorage with new data
4. Dispatch storage event
5. Context listens and updates
6. Page reload ensures all components sync

## Common Issues & Solutions

### Issue: "Only JPEG, PNG, and WebP images are allowed"
**Cause:** Trying to upload a URL instead of base64 data
**Solution:** Check if preview starts with `data:image/` before uploading

### Issue: Avatar not showing after update
**Cause:** localStorage not updated, context not refreshed
**Solution:** Update localStorage and reload page after save

### Issue: Banner not visible
**Cause:** Profile page doesn't have banner section
**Solution:** Add banner display at top of profile layout

### Issue: Images not loading
**Cause:** Incorrect image paths or getImageUrl() not working
**Solution:** Verify API_URL is correct and paths are relative

## Future Improvements

1. **Real-time Updates**: Use WebSocket or polling to update navbar without reload
2. **Image Optimization**: Compress images before upload
3. **Crop Tool**: Allow users to crop/resize images before upload
4. **Progress Indicator**: Show upload progress for large images
5. **Image Preview**: Better preview with zoom/pan capabilities
6. **Lazy Loading**: Load images progressively for better performance
7. **CDN Integration**: Serve images from CDN for faster loading
8. **Image Validation**: Client-side validation before upload

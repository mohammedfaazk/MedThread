# Task 7 - User Profile Enhancements Testing Guide

## Features to Test

### 1. Username Availability Check

#### Backend Endpoint
```bash
# Test username availability (should return available: true)
curl "http://localhost:3001/api/profile/check-username?username=newuser123"

# Test taken username (should return available: false)
curl "http://localhost:3001/api/profile/check-username?username=existinguser"

# Test invalid format (should return available: false with validation message)
curl "http://localhost:3001/api/profile/check-username?username=ab"
```

#### Frontend Testing
1. Navigate to `/settings/profile`
2. Try changing your username
3. Observe real-time validation:
   - ✓ Green checkmark for available usernames
   - ✗ Red X for taken usernames
   - Validation message appears below the field
   - Debounced checking (500ms delay)

### 2. Profile Update with Username

#### Test Steps
1. Go to `/settings/profile`
2. Change your username to something available
3. Update bio and other fields
4. Click "Save Changes"
5. Verify:
   - Profile updates successfully
   - Username is changed in the database
   - Navbar reflects the new username
   - Profile page accessible at `/u/new_username`

#### Edge Cases to Test
- Try updating to an existing username (should fail)
- Try invalid username formats (should show validation error)
- Try updating without changing username (should work)
- Try updating with empty username (should keep existing)

### 3. Navbar Avatar Display

#### Test Steps
1. Login with an account that has an avatar
2. Check navbar shows actual avatar image
3. Login with an account without avatar
4. Check navbar shows initials placeholder
5. Update avatar in profile settings
6. Verify navbar updates immediately

#### Visual Checks
- Avatar displays correctly (not broken image)
- Fallback to initials works
- Hover effects work properly
- Dropdown menu shows correct username

### 4. User Profile Page

#### Test Steps
1. Navigate to `/u/[username]` for various users
2. Verify:
   - Avatar displays correctly
   - Banner displays correctly
   - Username shows properly
   - Bio and specialty display
   - Karma and stats show
   - Profile tabs work

#### Test Different User Types
- Patient profile: `/u/patient_username`
- Doctor profile: `/u/doctor_username`
- Verified doctor profile: `/u/verified_doctor_username`

### 5. Signup Flow

#### Patient Signup
1. Go to `/signup`
2. Fill in username field
3. Verify validation works
4. Complete signup
5. Check profile created with username

#### Doctor Signup
1. Go to `/signup/doctor`
2. Fill in all fields including username
3. Complete multi-step form
4. Submit verification
5. Check profile created with username

## API Endpoints Summary

### New Endpoints
- `GET /api/profile/check-username?username=<username>` - Check username availability

### Updated Endpoints
- `PUT /api/profile/me/profile` - Now accepts `username` field

## Expected Responses

### Username Check - Available
```json
{
  "success": true,
  "data": {
    "available": true,
    "message": "Username is available"
  }
}
```

### Username Check - Taken
```json
{
  "success": true,
  "data": {
    "available": false,
    "message": "Username is already taken"
  }
}
```

### Username Check - Invalid Format
```json
{
  "success": true,
  "data": {
    "available": false,
    "message": "Username must be 3-20 characters and contain only letters, numbers, and underscores"
  }
}
```

### Profile Update Success
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "username": "new_username",
    "email": "user@example.com",
    "bio": "Updated bio",
    "avatar": "avatar_url",
    "banner": "banner_url"
  }
}
```

## Common Issues & Solutions

### Issue: Username not updating
- Check if username is already taken
- Verify format is correct (3-20 chars, alphanumeric + underscore)
- Check browser console for errors

### Issue: Avatar not showing in navbar
- Verify user object has avatar property
- Check getImageUrl() is working correctly
- Ensure image URL is accessible

### Issue: Profile page not found
- Verify username is correct
- Check route is `/u/[username]` not `/u/[username]/profile`
- Ensure user exists in database

### Issue: Real-time validation not working
- Check network tab for API calls
- Verify debounce is working (500ms delay)
- Check for JavaScript errors in console

## Performance Considerations

- Username availability check is debounced (500ms)
- Avatar images should be optimized
- Profile page should load within 2 seconds
- Real-time validation should feel instant

## Security Checks

- Username validation prevents SQL injection
- Only authenticated users can update profiles
- Username changes require availability check
- Profile updates validate all input fields

# File Upload System - Setup Checklist

## ✅ Implementation Complete - Ready for Setup

---

## 📋 Pre-Setup Checklist (Already Done)

- [x] Install dependencies (cloudinary, multer, sharp)
- [x] Create Cloudinary configuration
- [x] Create upload middleware
- [x] Create upload routes
- [x] Update chat upload to use Cloudinary
- [x] Create frontend upload utilities
- [x] Create reusable upload components
- [x] Update environment configuration
- [x] Test for TypeScript errors (0 errors found)
- [x] Restart API server successfully
- [x] Create comprehensive documentation

---

## 🚀 Your Setup Checklist (To Do)

### Step 1: Get Cloudinary Account (5 minutes)

- [ ] Go to https://cloudinary.com/users/register/free
- [ ] Sign up with your email
- [ ] Verify your email address
- [ ] Log in to dashboard

### Step 2: Get Credentials (2 minutes)

- [ ] Go to https://cloudinary.com/console
- [ ] Copy your **Cloud Name**
- [ ] Copy your **API Key**
- [ ] Copy your **API Secret**

### Step 3: Configure Environment (1 minute)

- [ ] Open `apps/api/.env`
- [ ] Replace these values:
  ```env
  CLOUDINARY_CLOUD_NAME="your_cloud_name"
  CLOUDINARY_API_KEY="your_api_key"
  CLOUDINARY_API_SECRET="your_api_secret"
  ```
- [ ] Save the file

### Step 4: Restart API Server (1 minute)

The API server should already be running. If not:

- [ ] Open terminal
- [ ] Run: `cd apps/api`
- [ ] Run: `npm run dev`
- [ ] Verify: "🏥 MedThread API running on port 3001"

### Step 5: Test Upload (5 minutes)

#### Option A: Test with cURL

- [ ] Login to get token:
  ```bash
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"meghamaryvinu@licet.ac.in","password":"12345678"}'
  ```
- [ ] Copy the token from response
- [ ] Test upload:
  ```bash
  curl -X POST http://localhost:3001/api/upload/single \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -F "file=@/path/to/image.jpg" \
    -F "folder=test"
  ```
- [ ] Verify you get a Cloudinary URL in response

#### Option B: Test in Browser

- [ ] Open your app at http://localhost:3000
- [ ] Login with test account
- [ ] Use any upload component
- [ ] Verify file uploads successfully
- [ ] Check Cloudinary dashboard for uploaded file

### Step 6: Verify in Cloudinary (2 minutes)

- [ ] Go to https://cloudinary.com/console/media_library
- [ ] Look for `medthread` folder
- [ ] Verify your test file is there
- [ ] Click on file to see details

---

## 🎯 Integration Checklist (Optional)

### Update Doctor Signup

- [ ] Replace base64 upload with new system
- [ ] Use `uploadFile()` for documents
- [ ] Use `uploadAvatar()` for profile picture
- [ ] Update database to store URLs instead of base64

### Add Profile Picture Upload

- [ ] Add `AvatarUpload` component to profile page
- [ ] Connect to user update API
- [ ] Test upload and display

### Enable Post Image Upload

- [ ] Add `FileUploadButton` to post creation
- [ ] Support multiple images
- [ ] Display uploaded images in post
- [ ] Test upload and display

### Add Video Upload

- [ ] Add video upload button
- [ ] Use `uploadFile()` with video files
- [ ] Add video player component
- [ ] Test upload and playback

### Migrate Existing Data

- [ ] Create migration script
- [ ] Use `uploadBase64()` to migrate
- [ ] Update database records
- [ ] Verify all files migrated

---

## 📊 Verification Checklist

### API Endpoints Working

- [ ] `POST /api/upload/single` - Returns Cloudinary URL
- [ ] `POST /api/upload/multiple` - Uploads multiple files
- [ ] `POST /api/upload/avatar` - Creates avatar + thumbnail
- [ ] `POST /api/upload/base64` - Converts base64 to URL
- [ ] `DELETE /api/upload/:publicId` - Deletes file
- [ ] `POST /api/chat/upload` - Chat upload works

### Frontend Components Working

- [ ] `FileUploadButton` - Uploads and shows preview
- [ ] `AvatarUpload` - Uploads avatar with hover effect
- [ ] Upload utilities - All functions work

### Features Working

- [ ] Image upload and optimization
- [ ] Video upload
- [ ] Document upload
- [ ] File size validation
- [ ] File type validation
- [ ] Authentication required
- [ ] Error handling
- [ ] Preview display

---

## 🐛 Troubleshooting Checklist

### If Upload Fails

- [ ] Check Cloudinary credentials in .env
- [ ] Verify no extra spaces in credentials
- [ ] Check API server is running
- [ ] Check authentication token is valid
- [ ] Check file size is under 10MB
- [ ] Check file type is allowed
- [ ] Check browser console for errors
- [ ] Check API logs for errors

### If Images Don't Display

- [ ] Verify Cloudinary URL is correct
- [ ] Check CORS settings
- [ ] Check image URL is accessible
- [ ] Check network tab in browser
- [ ] Verify file was uploaded to Cloudinary

### If Server Won't Start

- [ ] Check for syntax errors
- [ ] Run `npm install` in apps/api
- [ ] Check port 3001 is not in use
- [ ] Check .env file exists
- [ ] Check all dependencies installed

---

## 📚 Documentation Reference

- **Setup Guide**: `CLOUDINARY_SETUP.md`
- **Implementation Details**: `FILE_UPLOAD_IMPLEMENTATION_COMPLETE.md`
- **Testing Guide**: `TEST_FILE_UPLOAD.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`
- **This Checklist**: `SETUP_CHECKLIST.md`

---

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ API server starts without errors
2. ✅ You can upload a file via API
3. ✅ File appears in Cloudinary dashboard
4. ✅ You get a Cloudinary URL back
5. ✅ Image displays in browser
6. ✅ No console errors

---

## 🎉 Completion

Once all checkboxes are checked, your file upload system is:

- ✅ Fully configured
- ✅ Tested and working
- ✅ Ready for production use
- ✅ Integrated into your app

---

## 📞 Need Help?

1. Check the documentation files
2. Review error messages carefully
3. Verify Cloudinary credentials
4. Check API logs
5. Test with cURL first

---

**Total Setup Time**: ~15 minutes
**Difficulty**: Easy
**Status**: Ready to Go! 🚀

# Cloudinary Setup Guide

## Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com/users/register/free
2. Sign up for a free account (25GB storage, 25GB bandwidth/month)
3. Verify your email

## Step 2: Get Your Credentials

1. Log in to https://cloudinary.com/console
2. You'll see your dashboard with:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## Step 3: Configure Environment Variables

Add these to `apps/api/.env`:

```env
CLOUDINARY_CLOUD_NAME="your_cloud_name_here"
CLOUDINARY_API_KEY="your_api_key_here"
CLOUDINARY_API_SECRET="your_api_secret_here"
```

Replace the values with your actual credentials from the Cloudinary dashboard.

## Step 4: Test the Integration

1. Restart your API server:
   ```bash
   cd apps/api
   npm run dev
   ```

2. Test file upload:
   ```bash
   curl -X POST http://localhost:3001/api/upload/single \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "file=@/path/to/image.jpg" \
     -F "folder=test"
   ```

## Features Enabled

### 1. Single File Upload
- **Endpoint**: `POST /api/upload/single`
- **Max Size**: 10MB
- **Supported**: Images, Videos, Documents

### 2. Multiple File Upload
- **Endpoint**: `POST /api/upload/multiple`
- **Max Files**: 5
- **Max Size**: 10MB per file

### 3. Avatar Upload
- **Endpoint**: `POST /api/upload/avatar`
- **Features**: Auto-resize to 400x400, generates thumbnail
- **Max Size**: 10MB

### 4. Base64 Upload
- **Endpoint**: `POST /api/upload/base64`
- **Use**: Backward compatibility, migration

### 5. File Deletion
- **Endpoint**: `DELETE /api/upload/:publicId`
- **Use**: Remove files from Cloudinary

## Frontend Usage

```typescript
import { uploadFile, uploadAvatar, uploadMultipleFiles } from '@/lib/upload';

// Upload single file
const result = await uploadFile(file, 'posts', token);
console.log(result.data.url); // Cloudinary URL

// Upload avatar
const avatar = await uploadAvatar(file, token);
console.log(avatar.data.url); // Avatar URL
console.log(avatar.data.thumbnail.url); // Thumbnail URL

// Upload multiple files
const results = await uploadMultipleFiles([file1, file2], 'documents', token);
```

## Folder Structure in Cloudinary

Files are organized in folders:
- `medthread/avatars/` - Profile pictures
- `medthread/avatars/thumbnails/` - Avatar thumbnails
- `medthread/posts/` - Post images
- `medthread/chat-attachments/` - Chat files
- `medthread/documents/` - Verification documents
- `medthread/general/` - Other files

## Image Processing

All images are automatically:
- Resized to max 1200px width (maintaining aspect ratio)
- Compressed to 85% quality
- Converted to JPEG format
- Optimized for web delivery

Avatars are additionally:
- Cropped to 400x400px
- Thumbnail generated at 100x100px

## Security

- All endpoints require authentication (JWT token)
- File type validation on both frontend and backend
- Size limits enforced
- Malicious file detection by Cloudinary

## Troubleshooting

### Error: "Invalid credentials"
- Check your CLOUDINARY_CLOUD_NAME, API_KEY, and API_SECRET
- Make sure there are no extra spaces or quotes

### Error: "File too large"
- Max file size is 10MB
- Compress images before uploading

### Error: "File type not allowed"
- Check the allowed MIME types in `apps/api/src/middleware/upload.ts`
- Add your file type if needed

## Free Tier Limits

- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month
- **Videos**: 500MB storage, 1GB bandwidth

If you exceed these limits, you'll need to upgrade to a paid plan.

## Next Steps

1. Update doctor signup to use new upload system
2. Add profile picture upload for all users
3. Enable image upload in posts
4. Add video upload functionality
5. Migrate existing base64 data to Cloudinary

## Migration Script

To migrate existing base64 avatars to Cloudinary, run:

```bash
cd apps/api
npx tsx src/scripts/migrate-to-cloudinary.ts
```

(Script needs to be created separately)

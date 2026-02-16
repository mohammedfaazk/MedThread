# Post Edit & Delete - User Guide

## Quick Overview
Authors can now edit and delete their own posts using a simple dropdown menu.

---

## How to Edit a Post

### Step 1: Find Your Post
Look for the three-dot menu (⋯) in the top-right corner of your post. This only appears on posts you authored.

### Step 2: Click Edit
```
┌─────────────────────────────────────┐
│ Posted by u/yourname • 2 hours ago  │ ⋯ ← Click here
│                                     │ ┌──────────┐
│ My Post Title                       │ │ ✏️ Edit   │
│                                     │ │ 🗑️ Delete │
│ Post content here...                │ └──────────┘
└─────────────────────────────────────┘
```

### Step 3: Make Your Changes
The post switches to edit mode with text inputs:

```
┌─────────────────────────────────────┐
│ Posted by u/yourname • 2 hours ago  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ My Post Title                   │ │ ← Edit title
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Post content here...            │ │ ← Edit content
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│           [Cancel] [Save Changes]   │
└─────────────────────────────────────┘
```

### Step 4: Save or Cancel
- Click "Save Changes" to update your post
- Click "Cancel" to discard changes
- After saving, the post shows an "edited" indicator

---

## How to Delete a Post

### Step 1: Open Menu
Click the three-dot menu (⋯) on your post

### Step 2: Click Delete
```
┌──────────┐
│ ✏️ Edit   │
│ 🗑️ Delete │ ← Click here (red text)
└──────────┘
```

### Step 3: Confirm Deletion
A confirmation dialog appears:

```
┌─────────────────────────────────────┐
│  Are you sure you want to delete    │
│  this post? This action cannot be   │
│  undone.                            │
│                                     │
│         [Cancel]  [OK]              │
└─────────────────────────────────────┘
```

### Step 4: Post Deleted
- On post cards: Page reloads without the post
- On post detail page: Redirects to homepage
- Content becomes "[deleted]"

---

## Features

### ✅ What You Can Edit
- Post title
- Post content (text posts only)
- Cannot edit: type, community, media, links

### ✅ Edit Indicators
- "edited" label appears after editing
- Timestamp shows when edited
- Original post time preserved

### ✅ Delete Behavior
- Soft delete (post marked as removed)
- Content replaced with "[deleted]"
- Cannot be undone
- Removes from feeds

### ✅ Security
- Only authors can edit/delete their posts
- Login required
- Ownership verified on server
- Cannot edit others' posts

---

## Where It Works

### PostCard (Feed View)
- Home page
- Community pages
- User profiles
- Search results
- Saved posts

### PostDetail (Full View)
- Individual post pages
- Larger edit inputs
- Full content editing

---

## Tips

1. **Quick Edits**: Use PostCard inline editing for small changes
2. **Major Edits**: Open post detail page for better editing experience
3. **Check Before Delete**: Deletion cannot be undone
4. **Edit History**: "edited" indicator shows post was modified
5. **Content Limits**: Title cannot be empty

---

## Keyboard Shortcuts

- `Esc` - Close dropdown menu
- `Enter` - Submit edit (in title field)
- `Ctrl/Cmd + Enter` - Save changes (in content field)

---

## Troubleshooting

### Menu Not Showing?
- Make sure you're logged in
- Verify you're the post author
- Check username matches

### Can't Save Changes?
- Title cannot be empty
- Check internet connection
- Verify you're still logged in

### Delete Not Working?
- Confirm the deletion dialog
- Check internet connection
- Verify you're still logged in

---

## Examples

### Before Edit
```
┌─────────────────────────────────────┐
│ Posted by u/doctor123 • 1 hour ago  │ ⋯
│                                     │
│ Question about medication           │
│                                     │
│ I have a question about dosage...  │
└─────────────────────────────────────┘
```

### During Edit
```
┌─────────────────────────────────────┐
│ Posted by u/doctor123 • 1 hour ago  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Question about medication dosage│ │ ← Updated
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ I have a question about the     │ │ ← Updated
│ │ correct dosage for...           │ │
│ └─────────────────────────────────┘ │
│                                     │
│           [Cancel] [Save Changes]   │
└─────────────────────────────────────┘
```

### After Edit
```
┌─────────────────────────────────────┐
│ Posted by u/doctor123 • 1 hour ago  │ ⋯
│ • edited                            │ ← New indicator
│                                     │
│ Question about medication dosage    │ ← Updated
│                                     │
│ I have a question about the correct │ ← Updated
│ dosage for...                       │
└─────────────────────────────────────┘
```

### After Delete
```
┌─────────────────────────────────────┐
│ Posted by [deleted] • 1 hour ago    │
│                                     │
│ [deleted]                           │
│                                     │
│ [deleted]                           │
└─────────────────────────────────────┘
```

---

## API Reference (For Developers)

### Edit Post
```bash
PUT /api/v1/posts/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Updated title",
  "content": "Updated content"
}
```

### Delete Post
```bash
DELETE /api/v1/posts/:id
Authorization: Bearer YOUR_TOKEN
```

---

## Support

If you encounter issues:
1. Check your internet connection
2. Verify you're logged in
3. Refresh the page
4. Clear browser cache
5. Contact support if problem persists

---

**Last Updated**: February 2026
**Feature Status**: ✅ Live and Ready

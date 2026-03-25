# 🧪 Manual Testing Guide - Technical & Accessibility Features

## Prerequisites
1. Start backend: `cd apps/api && npm run dev`
2. Start frontend: `cd apps/web && npm run dev`
3. Login to the application
4. Have OpenAI API key configured for translation/voice features

---

## 1️⃣ HIGH CONTRAST MODE

### How to Test:
1. **Open the app** in your browser
2. **Look for the floating settings button** (bottom-right corner with gear icon)
3. **Click the settings button** to open Accessibility Panel
4. **Find "High Contrast Mode"** toggle under Visual Settings
5. **Toggle it ON**

### Expected Results:
✅ Background turns black (#000000)
✅ Text turns white (#ffffff)
✅ All borders become white and thicker (2px)
✅ Links turn cyan (#00ffff)
✅ Focus rings turn yellow (#ffff00)
✅ Buttons have bold text
✅ Images have increased contrast

### How to Verify:
- Inspect any element - background should be black
- Click any input field - should have yellow focus ring
- Check browser DevTools - `<html>` should have class `high-contrast`

---

## 2️⃣ SIMPLE MODE

### How to Test:
1. **Open Accessibility Panel** (settings button bottom-right)
2. **Find "Simple Mode"** toggle under Visual Settings
3. **Toggle it ON**

### Expected Results:
✅ All buttons become larger (min 48px height)
✅ Font sizes increase (1.1-1.2x)
✅ Spacing increases (1.5x)
✅ All animations stop
✅ Decorative elements disappear
✅ Rounded corners become simpler (8px)
✅ Icons become larger (32px)

### How to Verify:
- Measure any button - should be at least 48px tall
- Check browser DevTools - `<html>` should have class `simple-mode`
- Try hovering over elements - no animations should play

---

## 3️⃣ FONT SIZE CONTROL

### How to Test:
1. **Open Accessibility Panel**
2. **Find "Font Size"** section under Visual Settings
3. **Click the minus (-) button** to decrease
4. **Click the plus (+) button** to increase

### Expected Results:
✅ Small: 14px base font
✅ Medium: 16px base font (default)
✅ Large: 18px base font
✅ X-Large: 22px base font
✅ All text scales proportionally
✅ Progress bar shows current size

### How to Verify:
- Check computed font-size on `<html>` element in DevTools
- Should match: 14px, 16px, 18px, or 22px
- All text should scale accordingly

---

## 4️⃣ MULTI-LANGUAGE SUPPORT

### How to Test:
1. **Open Accessibility Panel**
2. **Scroll to "Language" section**
3. **Click on any language** (e.g., Hindi - हिंदी)
4. **Close the panel**

### Expected Results:
✅ Language selector shows checkmark on selected language
✅ Settings are saved to localStorage
✅ `<html>` lang attribute updates
✅ Font family changes for Indian languages
✅ RTL layout for Urdu/Arabic

### API Test:
```bash
# Test translation API
curl -X POST http://localhost:3001/api/v1/technical/translate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "text": "Hello, how are you?",
    "targetLang": "hi",
    "sourceLang": "en"
  }'
```

### Expected API Response:
```json
{
  "success": true,
  "data": {
    "translatedText": "नमस्ते, आप कैसे हैं?"
  }
}
```

---

## 5️⃣ VOICE-TO-TEXT

### How to Test:
1. **Go to any page with EnhancedMessageInput** (or create a test page)
2. **Click the microphone button**
3. **Allow microphone permissions** when prompted
4. **Speak clearly**: "Hello, this is a test message"
5. **Click the microphone again** to stop recording

### Expected Results:
✅ Microphone permission prompt appears
✅ Recording indicator shows (red pulsing button)
✅ Audio level visualization appears
✅ "Recording..." text displays
✅ After stopping: "Processing..." shows
✅ Transcript appears in green box
✅ Text is added to message input

### API Test:
```bash
# Test voice-to-text API (requires audio file)
curl -X POST http://localhost:3001/api/v1/technical/voice-to-text/transcribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@test-audio.mp3" \
  -F "language=en"
```

### Troubleshooting:
- If no permission prompt: Check browser settings → Site permissions → Microphone
- If error: Check console for detailed error message
- Supported formats: mp3, mp4, wav, webm, m4a (max 25MB)

---

## 6️⃣ TYPING INDICATORS

### How to Test:
1. **Open two browser windows** (or use incognito for second user)
2. **Login as different users** in each window
3. **Open the same conversation** in both windows
4. **In Window 1**: Start typing in the message input
5. **In Window 2**: Watch for typing indicator

### Expected Results:
✅ Window 2 shows "User is typing..." below messages
✅ Three animated dots appear (bouncing animation)
✅ Indicator disappears after 3 seconds of no typing
✅ Indicator disappears when user stops typing
✅ Multiple users typing shows "2 people are typing..."

### API Test:
```bash
# Start typing
curl -X POST http://localhost:3001/api/v1/technical/typing/CONVERSATION_ID/start \
  -H "Authorization: Bearer YOUR_TOKEN"

# Stop typing
curl -X POST http://localhost:3001/api/v1/technical/typing/CONVERSATION_ID/stop \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get typing users
curl http://localhost:3001/api/v1/technical/typing/CONVERSATION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Troubleshooting:
- Check Socket.io connection in Network tab (should show WebSocket)
- Check console for "[Socket] Connected" message
- Verify both users are in the same conversation

---

## 7️⃣ MESSAGE CACHING (OFFLINE MODE)

### How to Test:
1. **Open the app** and login
2. **Open a conversation** with messages
3. **Open DevTools** → Network tab
4. **Toggle "Offline" mode** in Network tab
5. **Refresh the page**

### Expected Results:
✅ Orange banner appears: "You're offline"
✅ "Cached content available" message shows
✅ Previously loaded messages still visible
✅ Can scroll through cached messages
✅ Cannot send new messages (disabled)

### Online Again:
1. **Toggle "Online" mode** in Network tab
2. **Expected**: Green banner "Back online" appears
3. **Expected**: Can send messages again

### API Test:
```bash
# Cache messages for offline
curl -X POST http://localhost:3001/api/v1/technical/cache/messages/CONVERSATION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get cached messages
curl http://localhost:3001/api/v1/technical/cache/messages/CONVERSATION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Prefetch multiple conversations
curl -X POST http://localhost:3001/api/v1/technical/cache/prefetch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "conversationIds": ["conv1", "conv2", "conv3"]
  }'

# Get cache stats
curl http://localhost:3001/api/v1/technical/cache/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 8️⃣ ERROR HANDLING

### How to Test:

#### Test 1: Component Error
1. **Create a test page** that throws an error:
```tsx
// Test page
export default function ErrorTest() {
  throw new Error('Test error');
  return <div>This won't render</div>;
}
```
2. **Navigate to the page**

### Expected Results:
✅ Error boundary catches the error
✅ Beautiful error page displays with:
  - Red alert icon
  - "Oops! Something went wrong" heading
  - Error details (in development)
  - Three buttons: Try Again, Reload Page, Go Home
✅ No white screen of death
✅ Error logged to console

#### Test 2: Network Error
1. **Stop the backend server**
2. **Try to load data** (e.g., open a page that fetches data)

### Expected Results:
✅ Error message displays in red box
✅ Retry button appears
✅ User-friendly error text (not technical jargon)

#### Test 3: Form Validation Error
1. **Try to submit a form** with invalid data
2. **Expected**: Red error message with clear instructions

---

## 9️⃣ REDUCED MOTION

### How to Test:
1. **Open Accessibility Panel**
2. **Find "Reduce Motion"** toggle
3. **Toggle it ON**

### Expected Results:
✅ All animations stop
✅ Transitions become instant (0.01ms)
✅ Scroll behavior becomes instant
✅ Loading spinners still work but don't animate
✅ No bouncing, pulsing, or sliding effects

### How to Verify:
- Check DevTools - `<html>` should have class `reduced-motion`
- Try hovering over buttons - no smooth transitions
- Scroll page - instant, no smooth scrolling

---

## 🔟 SCREEN READER OPTIMIZATION

### How to Test:
1. **Open Accessibility Panel**
2. **Find "Screen Reader Optimization"** toggle
3. **Toggle it ON**
4. **Enable screen reader** (NVDA on Windows, VoiceOver on Mac)

### Expected Results:
✅ All interactive elements have aria-labels
✅ Focus indicators are very visible (3px blue outline)
✅ Skip to main content link appears on Tab
✅ Semantic HTML structure
✅ Form labels properly associated

### How to Verify:
- Press Tab key - should see clear focus indicators
- Use screen reader - should announce all elements clearly
- Check DevTools - elements should have proper ARIA attributes

---

## 🎯 QUICK ACTIONS TEST

### Test "Maximum Accessibility":
1. **Open Accessibility Panel**
2. **Click "Maximum Accessibility"** button under Quick Actions

### Expected Results:
✅ High Contrast: ON
✅ Simple Mode: ON
✅ Font Size: X-Large
✅ Reduced Motion: ON
✅ All changes apply immediately

### Test "Reset to Default":
1. **Click "Reset to Default"** button

### Expected Results:
✅ All settings return to default
✅ High Contrast: OFF
✅ Simple Mode: OFF
✅ Font Size: Medium
✅ Reduced Motion: OFF

---

## 📱 MOBILE TESTING

### How to Test:
1. **Open DevTools** → Toggle device toolbar (Ctrl+Shift+M)
2. **Select a mobile device** (e.g., iPhone 12)
3. **Test all features above**

### Additional Mobile Checks:
✅ Touch targets are at least 44x44px
✅ Accessibility button is easily reachable
✅ Font sizes are readable on small screens
✅ Voice input works on mobile
✅ Offline mode works on mobile

---

## 🔍 BROWSER COMPATIBILITY

### Test in Multiple Browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (Mac/iOS)

### Features to Verify:
- High contrast mode works
- Voice input works (requires HTTPS or localhost)
- Offline mode works
- All CSS styles apply correctly

---

## 📊 PERFORMANCE TESTING

### Test Cache Performance:
1. **Open DevTools** → Network tab
2. **Load a conversation** (note load time)
3. **Refresh the page** (should be faster with cache)
4. **Go offline** → Refresh (should load from cache)

### Expected Results:
✅ First load: Fetches from API
✅ Second load: Faster (uses cache)
✅ Offline load: Instant (uses cache)
✅ No network requests when offline

---

## ✅ CHECKLIST

Use this checklist to verify all features:

- [ ] High Contrast Mode toggles and applies styles
- [ ] Simple Mode toggles and applies styles
- [ ] Font size increases/decreases (4 levels)
- [ ] Language selector shows 10+ languages
- [ ] Voice input records and transcribes
- [ ] Typing indicator shows in real-time
- [ ] Offline mode shows cached messages
- [ ] Error boundary catches errors gracefully
- [ ] Reduced motion stops animations
- [ ] Screen reader optimization works
- [ ] Maximum Accessibility applies all settings
- [ ] Reset to Default clears all settings
- [ ] Settings persist after page refresh
- [ ] Mobile touch targets are large enough
- [ ] All features work in multiple browsers

---

## 🐛 TROUBLESHOOTING

### Voice Input Not Working:
- Check microphone permissions in browser
- Ensure HTTPS or localhost (required for getUserMedia)
- Check OpenAI API key is configured
- Check console for errors

### Translation Not Working:
- Verify OpenAI API key is set
- Check API endpoint is accessible
- Check console for API errors
- Verify language code is valid

### Typing Indicators Not Showing:
- Check Socket.io connection (Network tab)
- Verify both users are in same conversation
- Check console for socket errors
- Ensure backend is running

### Offline Mode Not Working:
- Check if messages were cached before going offline
- Verify localStorage is enabled
- Check console for cache errors
- Try prefetch API first

### Styles Not Applying:
- Verify accessibility.css is imported
- Check if classes are added to `<html>` element
- Clear browser cache
- Check for CSS conflicts

---

## 📝 NOTES

- All settings are saved to localStorage
- Settings persist across page refreshes
- Voice features require HTTPS (except localhost)
- Translation requires OpenAI API key
- Offline mode requires prior caching
- Socket.io required for typing indicators

---

## 🎉 SUCCESS CRITERIA

All features are working if:
1. ✅ All toggles in Accessibility Panel work
2. ✅ Visual changes apply immediately
3. ✅ Voice input transcribes accurately
4. ✅ Typing indicators show in real-time
5. ✅ Offline mode displays cached content
6. ✅ Errors are caught and displayed nicely
7. ✅ Settings persist after refresh
8. ✅ All API endpoints return success

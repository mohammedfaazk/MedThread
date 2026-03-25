# 🔍 Accessibility Styles Diagnostic

## Status Check

### ✅ What's Working

1. **CSS File Exists**: `apps/web/src/styles/accessibility.css` ✅
2. **CSS Imported**: In `apps/web/src/app/layout.tsx` line 4 ✅
3. **Context Provider**: `AccessibilityProvider` wraps the app ✅
4. **Class Management**: `applySettings()` function adds/removes classes ✅
5. **LocalStorage**: Settings are saved and loaded ✅

### 🔧 How It Works

```typescript
// 1. User toggles setting in AccessibilityPanel
toggleHighContrast()

// 2. Context updates state
setSettings({ ...settings, highContrastMode: true })

// 3. useEffect triggers
useEffect(() => {
  applySettings(settings);
}, [settings]);

// 4. Classes added to <html>
document.documentElement.classList.add('high-contrast');

// 5. CSS applies
.high-contrast body {
  background-color: #000000;
  color: #ffffff;
}
```

---

## 🧪 Testing Steps

### Test 1: Check if CSS is Loaded

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by "CSS"
4. Look for `accessibility.css`
5. **Expected**: Should see it loaded with status 200

### Test 2: Check HTML Classes

1. Open browser DevTools (F12)
2. Go to **Elements** tab
3. Click on `<html>` element (first line)
4. Look at the classes
5. **Expected**: Should see classes like `high-contrast`, `simple-mode` when toggled

### Test 3: Use Test Page

1. Go to: http://localhost:3000/test-accessibility.html
2. Click "Check CSS Loaded"
3. Click "Check HTML Classes"
4. Toggle features and watch the status update
5. **Expected**: All tests should pass

### Test 4: Check Computed Styles

1. Open DevTools → Elements
2. Select `<html>` element
3. Go to **Computed** tab
4. Search for `font-size`
5. **Expected**: Should change when you adjust font size

### Test 5: Manual Toggle

Open browser console and run:

```javascript
// Add high contrast
document.documentElement.classList.add('high-contrast');

// Check if it worked
document.body.style.backgroundColor; // Should be black or dark

// Remove it
document.documentElement.classList.remove('high-contrast');
```

---

## 🐛 Common Issues & Fixes

### Issue 1: Styles Not Applying

**Symptoms**: Classes are added but no visual change

**Causes**:
- CSS specificity conflict
- Other styles overriding
- CSS not loaded

**Fix**:
```bash
# Clear Next.js cache
cd apps/web
rm -rf .next
npm run dev
```

### Issue 2: Classes Not Added

**Symptoms**: No classes on `<html>` element

**Causes**:
- AccessibilityProvider not wrapping app
- JavaScript error preventing execution
- Settings not saving to localStorage

**Fix**:
1. Check browser console for errors
2. Verify `AccessibilityProvider` in layout.tsx
3. Check localStorage: `localStorage.getItem('accessibility_settings')`

### Issue 3: Settings Not Persisting

**Symptoms**: Settings reset on page refresh

**Causes**:
- localStorage blocked
- Incognito mode
- Browser settings

**Fix**:
1. Check if localStorage works: `localStorage.setItem('test', '1')`
2. Disable incognito mode
3. Check browser privacy settings

### Issue 4: CSS Specificity

**Symptoms**: Some elements don't change

**Causes**:
- Inline styles overriding
- Higher specificity selectors
- `!important` rules

**Fix**: Add `!important` to accessibility.css rules:
```css
.high-contrast body {
  background-color: #000000 !important;
  color: #ffffff !important;
}
```

---

## 🔍 Debugging Commands

### Check if CSS is loaded:
```javascript
Array.from(document.styleSheets).find(s => s.href?.includes('accessibility'))
```

### Check HTML classes:
```javascript
document.documentElement.className
```

### Check font size attribute:
```javascript
document.documentElement.getAttribute('data-font-size')
```

### Check computed styles:
```javascript
window.getComputedStyle(document.documentElement).fontSize
window.getComputedStyle(document.body).backgroundColor
```

### Check localStorage:
```javascript
JSON.parse(localStorage.getItem('accessibility_settings'))
```

### Force apply settings:
```javascript
// High contrast
document.documentElement.classList.add('high-contrast');

// Simple mode
document.documentElement.classList.add('simple-mode');

// Font size
document.documentElement.setAttribute('data-font-size', 'xlarge');
```

---

## 📋 Verification Checklist

Run through this checklist:

- [ ] Open http://localhost:3000
- [ ] Open DevTools (F12)
- [ ] Check Network tab for `accessibility.css` (status 200)
- [ ] Open Accessibility Panel (settings button bottom-right)
- [ ] Toggle High Contrast Mode
- [ ] Check Elements tab → `<html>` has class `high-contrast`
- [ ] Check body background is black
- [ ] Toggle Simple Mode
- [ ] Check `<html>` has class `simple-mode`
- [ ] Check buttons are larger (48px min)
- [ ] Increase font size
- [ ] Check `<html>` has attribute `data-font-size="large"`
- [ ] Check text is larger
- [ ] Refresh page
- [ ] Settings should persist

---

## 🚀 Quick Fix Script

If nothing works, run this in browser console:

```javascript
// Force enable all accessibility features
const html = document.documentElement;

// High contrast
html.classList.add('high-contrast');
document.body.style.backgroundColor = '#000000';
document.body.style.color = '#ffffff';

// Simple mode
html.classList.add('simple-mode');
document.querySelectorAll('button').forEach(btn => {
  btn.style.minHeight = '48px';
  btn.style.minWidth = '48px';
});

// Large font
html.setAttribute('data-font-size', 'xlarge');
html.style.fontSize = '22px';

console.log('✅ Accessibility features force-enabled');
console.log('HTML classes:', html.className);
console.log('Font size:', html.getAttribute('data-font-size'));
```

---

## 📞 Still Not Working?

If styles still aren't applying after all checks:

1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear cache**: DevTools → Network → Disable cache checkbox
3. **Restart dev server**: Stop and run `npm run dev` again
4. **Check browser**: Try different browser (Chrome, Firefox, Edge)
5. **Check console**: Look for JavaScript errors
6. **Verify file path**: Ensure `apps/web/src/styles/accessibility.css` exists

---

## ✅ Expected Behavior

When working correctly:

1. Click settings button → Panel opens
2. Toggle High Contrast → Background turns black immediately
3. Toggle Simple Mode → Buttons get larger immediately
4. Change font size → Text size changes immediately
5. Refresh page → All settings persist
6. Check HTML element → Has correct classes
7. Check DevTools → No console errors

---

Last Updated: March 25, 2026

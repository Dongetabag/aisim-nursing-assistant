# AISim Nursing Assistant - Troubleshooting Guide

## Issue: UI Not Showing Premium Dark Theme

### Symptoms
- White background instead of black
- Standard fonts instead of Playfair Display + Inter
- Missing glass morphism effects
- Old styling visible

### Solution: Browser Cache Issue

The most common cause is **browser caching**. Your browser is showing the old cached version of the CSS file.

### Quick Fix Options:

#### Option 1: Hard Refresh (Recommended)
**On Mac:**
- Press `Cmd + Shift + R`
- Or `Cmd + Option + R`

**On Windows/Linux:**
- Press `Ctrl + Shift + R`
- Or `Ctrl + F5`

#### Option 2: Clear Browser Cache
1. Open Browser Settings
2. Clear browsing data
3. Select "Cached images and files"
4. Clear for "Last hour" or "All time"
5. Refresh the page

#### Option 3: Use Incognito/Private Window
1. Open a new incognito/private browsing window
2. Visit `http://localhost:3000`
3. The fresh session will load the new styles

#### Option 4: Force Reload Without Cache
**Chrome/Edge:**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Firefox:**
1. Open DevTools (F12)
2. Click the refresh button while holding Shift

**Safari:**
1. Enable Develop menu (Preferences > Advanced)
2. Develop > Empty Caches
3. Refresh the page

---

## Verification Steps

After clearing cache, you should see:

✅ **Black background** throughout the application
✅ **Playfair Display** font for headings
✅ **Inter** font for body text
✅ **Glass morphism** cards with subtle transparency
✅ **Premium shadows** and depth effects
✅ **Smooth animations** on hover
✅ **Professional dark header** with gradient logo

---

## Still Having Issues?

### Check 1: Verify Server is Running
```bash
curl http://localhost:3000
```
Should return HTML content.

### Check 2: Verify CSS is Loading
```bash
curl http://localhost:3000/styles.css | head -20
```
Should show CSS starting with:
```css
/* AISim Nursing Assistant - Premium Brand Styles */
@import url('https://fonts.googleapis.com/css2?family=Inter...
```

### Check 3: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for any errors (red text)
4. Common issues:
   - 404 errors for CSS file
   - CORS errors
   - Font loading errors

### Check 4: Verify File Paths
The CSS file should be at:
```
/Users/simeonreid/AiSIm Nursing Assisatnt/frontend/styles.css
```

### Check 5: Restart Server
```bash
cd "/Users/simeonreid/AiSIm Nursing Assisatnt"
# Kill any existing processes
pkill -f "node server.js"
lsof -ti:3000 | xargs kill -9

# Start fresh
node server.js
```

---

## Technical Details

### Cache-Busting Implemented
The HTML now includes a version parameter:
```html
<link rel="stylesheet" href="styles.css?v=1.1">
```

This forces browsers to reload the CSS when the version changes.

### Font Loading
The application uses Google Fonts CDN:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">
```

If fonts don't load:
1. Check internet connection
2. Verify no ad blockers are blocking Google Fonts
3. Check browser console for font loading errors

---

## Development Mode

### Hot Reload Issues
If you're making CSS changes and they're not appearing:

1. **Save the file** - Ensure CSS file is saved
2. **Clear cache** - Use hard refresh
3. **Check timestamp** - Verify file modification time
4. **Restart server** - Sometimes necessary for static files

### Testing in Multiple Browsers
Test the premium UI in:
- Chrome/Edge (Chromium)
- Firefox
- Safari (Mac only)

Each browser may cache differently.

---

## Contact & Support

If issues persist after trying all solutions:

1. **Check GitHub Issues**: [github.com/Dongetabag/aisim-nursing-assistant](https://github.com/Dongetabag/aisim-nursing-assistant)
2. **Create Issue**: Include browser, OS, and error messages
3. **Documentation**: Review README.md for setup instructions

---

## Quick Reference

**Server URL:** http://localhost:3000
**GitHub:** https://github.com/Dongetabag/aisim-nursing-assistant
**Live Demo:** https://aisim-nursing-assistant.vercel.app

**Hard Refresh:**
- Mac: `Cmd + Shift + R`
- Windows/Linux: `Ctrl + Shift + R`

---

**Last Updated:** October 2025
**Version:** 1.1

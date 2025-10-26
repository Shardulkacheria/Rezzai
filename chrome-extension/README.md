# RezzAI Chrome Extension

## Setup Instructions

1. **Load the Extension in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select this `chrome-extension` folder
   - The extension will appear in your extensions list

2. **Get Extension ID:**
   - After loading, copy the Extension ID from the extensions page
   - Update `src/lib/extensionBridge.js` line 3:
     ```javascript
     const EXTENSION_ID = 'YOUR_ACTUAL_EXTENSION_ID_HERE';
     ```

3. **Test the Integration:**
   - Start your Next.js app: `npm run dev`
   - Go to the dashboard and look for "Apply on LinkedIn" buttons
   - Click the button to test the extension integration

## Features

- **Auto-fill LinkedIn job applications** with user data from RezzAI
- **Floating button** appears on LinkedIn job pages
- **Form field detection** for name, email, phone, location, cover letter
- **Resume upload guidance** (manual due to browser security)
- **Real-time status updates** in the popup

## Files

- `manifest.json` - Extension configuration (no icons required)
- `background.js` - Service worker for data storage
- `content.js` - LinkedIn page injection script
- `popup/` - Extension popup interface

## Security

- Only works on `linkedin.com/jobs/*` pages
- Data stored locally in Chrome storage
- No external data transmission

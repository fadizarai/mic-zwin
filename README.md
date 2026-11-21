# MIC Zwin lel Tech – Win? 🚀

Registration portal for **MIC Zwin lel Tech**, presented by **Microsoft Club ISSATSo**.

## 📁 Project Structure

```text
├── index.html        # Main landing & registration page
├── assets/           # Logos, audio, and visual assets
├── css/              # Stylesheets
├── js/               # Client-side form handling and validation
└── apps-script/      # Google Apps Script backend (Code.gs)
```

## ⚙️ Setup & Configuration

1. **Deploy Google Apps Script**:
   - Open a Google Sheet and go to **Extensions > Apps Script**.
   - Paste the code from `apps-script/Code.gs`.
   - Click **Deploy > New deployment**, select **Web app**, set execution to **Me** and access to **Anyone**.
   - Copy the deployed Web App URL.

2. **Connect Form**:
   - In `js/script.js`, set `CONFIG.sheetUrl` to your deployed Web App URL.

# MIC Zwin lel Tech

Event landing page and team registration portal for **MIC Zwin lel Tech** (Microsoft Club ISSATSo).

## 🚀 How to Run Locally

You can run the project using any of the following:

- **Directly**: Double-click `index.html` to open it in your browser.
- **VS Code**: Install the **Live Server** extension, right-click `index.html`, and select **Open with Live Server**.
- **Node.js**:
  ```bash
  npx serve .
  ```
- **Python**:
  ```bash
  python -m http.server 3000
  ```

## ⚙️ Configuration

The registration form sends submissions to a Google Sheet via Google Apps Script:

1. In your Google Sheet, open **Extensions > Apps Script** and paste `apps-script/Code.gs`.
2. Deploy as a Web App (**Execute as: Me**, **Access: Anyone**).
3. Paste your Web App URL into `CONFIG.sheetUrl` inside `js/script.js`.

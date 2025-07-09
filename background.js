// Handles Google Sheets upload and messaging

// Helper: Parse Google Sheet ID from URL (no longer used)
// function getSheetId(url) {
//   const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
//   return m ? m[1] : null;
// }

// Listen for messages from content script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'extractResult') {
    console.log('FB Extractor background received extractResult:', msg);
    if (!msg.success) {
      // Try to notify content script, but ignore errors if not present
      chrome.tabs.sendMessage(sender.tab.id, { type: 'notify', message: msg.message, success: false }, () => {
        if (chrome.runtime.lastError) {
          // The receiving end does not exist, ignore this error
        }
      });
      return;
    }
    // Get current operation and append extracted data to local storage under the operation
    chrome.storage.local.get(['currentOperation', 'operations'], (data) => {
      const op = data.currentOperation;
      if (!op || !(data.operations && Object.prototype.hasOwnProperty.call(data.operations, op))) {
        chrome.tabs.sendMessage(sender.tab.id, { type: 'notify', message: 'No operation selected.', success: false }, () => {
          if (chrome.runtime.lastError) {
            // The receiving end does not exist, ignore this error
          }
        });
        return;
      }
      const opDataKey = 'extractedData_' + op;
      chrome.storage.local.get([opDataKey], (d) => {
        const oldPages = Array.isArray(d[opDataKey]) ? d[opDataKey] : [];
        // Merge old and new, avoiding duplicates by link
        const combined = [...oldPages];
        msg.pages.forEach(newPage => {
          if (!combined.some(p => p.link === newPage.link)) {
            combined.push(newPage);
          }
        });
        chrome.storage.local.set({ [opDataKey]: combined }, () => {
          // Always show completed if local save is successful
          chrome.tabs.sendMessage(sender.tab.id, { type: 'notify', message: 'Extraction completed and saved locally!', success: true }, () => {
            if (chrome.runtime.lastError) {
              // The receiving end does not exist, ignore this error
            }
          });
        });
      });
    });
  }
  // Handle reset request
  if (msg.type === 'resetExtractedData') {
    const op = msg.operationName;
    if (!op) return;
    const opDataKey = 'extractedData_' + op;
    chrome.storage.local.remove([opDataKey], () => {
      // Optionally notify sender
      if (sender && sender.tab && sender.tab.id) {
        chrome.tabs.sendMessage(sender.tab.id, { type: 'notify', message: 'Extracted data reset for operation: ' + op, success: true }, () => {
          if (chrome.runtime.lastError) {
            // The receiving end does not exist, ignore this error
          }
        });
      }
    });
  }
});

// Google Sheets upload removed (API key no longer needed)
// function uploadToSheet(sheetUrl, pages, callback) {
//   // ...removed...
// }

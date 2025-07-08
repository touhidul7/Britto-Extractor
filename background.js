// Handles Google Sheets upload and messaging

// Helper: Parse Google Sheet ID from URL
function getSheetId(url) {
  const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return m ? m[1] : null;
}

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
});

// Uploads data to Google Sheet using Sheets API
function uploadToSheet(sheetUrl, pages, callback) {
  // Use Google Sheets API with API key (sheet must be public with edit access)
  chrome.storage.local.get(['sheetsApiKey'], (data) => {
    const apiKey = data.sheetsApiKey;
    if (!apiKey) {
      callback(false, 'Google Sheets API key not set.');
      return;
    }
    const sheetId = getSheetId(sheetUrl);
    if (!sheetId) {
      callback(false, 'Invalid Google Sheet URL.');
      return;
    }
    // Default to first sheet/tab
    const range = 'A1';
    const values = pages.map(p => [p.name, p.link]);
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED&key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values })
    })
      .then(r => r.json())
      .then(res => {
        if (res.updates && res.updates.updatedRows > 0) {
          callback(true, `Uploaded ${pages.length} pages to sheet!`);
        } else {
          callback(false, 'Failed to update sheet. Check API key and sheet permissions.');
        }
      })
      .catch(e => callback(false, 'Error: ' + e.message));
  });
}

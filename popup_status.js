// Receives status updates from content script and updates popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'popupStatus') {
    chrome.runtime.sendMessage({ type: 'updatePopup', ...msg });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'updatePopup') {
      const statusDiv = document.getElementById('status');
      statusDiv.textContent = msg.message;
      statusDiv.className = msg.success ? 'success' : 'error';
    }
  });
});

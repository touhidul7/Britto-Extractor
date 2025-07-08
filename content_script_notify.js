// Listens for notifications from background and shows status in popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'notify') {
    // Try to update popup status if open
    chrome.runtime.sendMessage({ type: 'popupStatus', ...msg });
    // Also show a browser notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: msg.success ? 'Success' : 'Error',
      message: msg.message
    });
  }
});

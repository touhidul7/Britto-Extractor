// Extracts Facebook page names and links from search results
(async function() {
  function extractPages() {
    // More robust: look for all links that look like FB pages in search results
    const results = [];
    // Facebook search results are often in div[role="main"]
    const main = document.querySelector('div[role="main"]') || document.body;
    main.querySelectorAll('a[href*="facebook.com/"]').forEach(a => {
      const href = a.href;
      const name = a.textContent.trim();
      // Log all links for debugging
      if (name && href) {
        console.log('FB Extractor found link:', name, href);
      }
      // Permissive: collect all facebook.com links with visible text
      if (name && href && !results.some(r => r.link === href)) {
        results.push({ name, link: href });
      }
    });
    return results;
  }

  try {
    const pages = extractPages();
    console.log('FB Extractor extracted pages:', pages);
    if (!pages.length) {
      chrome.runtime.sendMessage({ type: 'extractResult', success: false, message: 'No pages found. Try scrolling or changing search.' });
      return;
    }
    // Send data to background for Google Sheets upload
    chrome.runtime.sendMessage({ type: 'extractResult', success: true, pages });
  } catch (e) {
    chrome.runtime.sendMessage({ type: 'extractResult', success: false, message: 'Extraction error: ' + e.message });
  }
})();

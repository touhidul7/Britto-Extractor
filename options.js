// No API key input needed, set default API key automatically
chrome.storage.local.set({ sheetsApiKey: 'AIzaSyCNd-Mi6NAQn-WvHjizKkPl6cXtUAiiiLc' });

// --- Operation Data Viewer ---
const opSelect = document.getElementById('operationSelect');
const loadDataBtn = document.getElementById('loadDataBtn');
const downloadDataBtn = document.getElementById('downloadDataBtn');
const opDataArea = document.getElementById('operationData');

// Populate operation select
chrome.storage.local.get(['operations'], (data) => {
  const ops = data.operations || {};
  for (const name in ops) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    opSelect.appendChild(opt);
  }
});


// Load data for selected operation
loadDataBtn.onclick = () => {
  const op = opSelect.value;
  if (!op) return;
  const opDataKey = 'extractedData_' + op;
  chrome.storage.local.get([opDataKey], (d) => {
    const arr = d[opDataKey] || [];
    opDataArea.value = arr.map(row => `${row.name}\t${row.link}`).join('\n');
  });
};

// Download as CSV
downloadDataBtn.onclick = () => {
  const op = opSelect.value;
  if (!op) return;
  const opDataKey = 'extractedData_' + op;
  chrome.storage.local.get([opDataKey], (d) => {
    const arr = d[opDataKey] || [];
    const csv = 'Name,Link\n' + arr.map(row => `"${row.name.replace(/"/g,'""')}","${row.link.replace(/"/g,'""')}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = op + '_facebook_pages.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  });
};

// --- Reset Data for Operation (NEW) ---
const resetDataBtn = document.createElement('button');
resetDataBtn.textContent = 'Reset Data';
resetDataBtn.style.marginLeft = '10px';
opSelect.parentNode.insertBefore(resetDataBtn, loadDataBtn.nextSibling);

resetDataBtn.onclick = () => {
  const op = opSelect.value;
  if (!op) return;
  chrome.runtime.sendMessage({ type: 'resetExtractedData', operationName: op }, () => {
    opDataArea.value = '';
    alert('Extracted data reset for operation: ' + op);
  });
};

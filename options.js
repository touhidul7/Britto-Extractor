
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


// Load data for selected operation (show as table only)
loadDataBtn.onclick = () => {
  const op = opSelect.value;
  if (!op) return;
  const opDataKey = 'extractedData_' + op;
  chrome.storage.local.get([opDataKey], (d) => {
    const arr = d[opDataKey] || [];
    let html = '<table><thead><tr><th>Name</th><th>Link</th></tr></thead><tbody>';
    arr.forEach(row => {
      html += `<tr><td title="${row.name ? row.name.replace(/"/g,'&quot;') : ''}">${row.name ? row.name.replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''}</td><td title="${row.link}"><a href="${row.link}" target="_blank">${row.link}</a></td></tr>`;
    });
    html += '</tbody></table>';
    let tableDiv = document.getElementById('operationDataTable');
    if (!tableDiv) {
      tableDiv = document.createElement('div');
      tableDiv.id = 'operationDataTable';
      document.getElementById('operationDataSection').appendChild(tableDiv);
    }
    tableDiv.innerHTML = html;
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
resetDataBtn.style.background = '#f44336';
resetDataBtn.style.color = 'white';
resetDataBtn.style.border = 'none';
resetDataBtn.style.padding = '8px 16px';
resetDataBtn.style.borderRadius = '4px';
resetDataBtn.style.fontSize = '16px';
resetDataBtn.style.cursor = 'pointer';
loadDataBtn.parentNode.appendChild(resetDataBtn);

resetDataBtn.onclick = () => {
  const op = opSelect.value;
  if (!op) return;
  if (!window.confirm('Are you sure you want to reset all extracted data for this data set? This cannot be undone.')) return;
  chrome.runtime.sendMessage({ type: 'resetExtractedData', operationName: op });
  let tableDiv = document.getElementById('operationDataTable');
  if (tableDiv) tableDiv.innerHTML = '';
  alert('Extracted data reset for operation: ' + op);
};

// Handles operation management and extraction trigger
const operationNameInput = document.getElementById('operationName');
const saveOperationBtn = document.getElementById('saveOperation');
const operationList = document.getElementById('operationList');
const startExtractBtn = document.getElementById('startExtract');
const statusDiv = document.getElementById('status');

// Tab logic
const operationTab = document.getElementById('operationTab');
const dataSetTab = document.getElementById('dataSetTab');
const searchContainer = document.querySelector('.search-container');
const dataContainer = document.querySelector('.data-container');

function showTab(tab) {
  if (tab === 'operation') {
    operationTab.classList.add('active');
    dataSetTab.classList.remove('active');
    searchContainer.style.display = '';
    dataContainer.style.display = 'none';
  } else {
    operationTab.classList.remove('active');
    dataSetTab.classList.add('active');
    searchContainer.style.display = 'none';
    dataContainer.style.display = '';
  }
}

operationTab.onclick = () => showTab('operation');
dataSetTab.onclick = () => showTab('data');

// Set initial tab
document.addEventListener('DOMContentLoaded', () => {
  showTab('operation');
});

// Load saved operations
function loadOperations() {
  chrome.storage.local.get(['operations', 'currentOperation'], (data) => {
    operationList.innerHTML = '';
    const ops = data.operations || {};
    for (const name in ops) {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      operationList.appendChild(opt);
    }
    if (data.currentOperation) {
      operationList.value = data.currentOperation;
      operationNameInput.value = data.currentOperation;
      // No sheet URL needed
    }
  });
}

saveOperationBtn.onclick = () => {
  const name = operationNameInput.value.trim();
  if (!name) {
    statusDiv.textContent = 'Please enter operation name.';
    statusDiv.className = 'error';
    return;
  }
  chrome.storage.local.get(['operations'], (data) => {
    const ops = data.operations || {};
    // If this is a new operation, clear any old extracted data for it
    const isNew = !(name in ops);
    ops[name] = {};
    const updates = { operations: ops, currentOperation: name };
    if (isNew) {
      updates['extractedData_' + name] = [];
    }
    chrome.storage.local.set(updates, loadOperations);
    statusDiv.textContent = 'Operation saved!';
    statusDiv.className = 'success';
  });



const resetDataBtnPopup = document.getElementById('resetDataBtnPopup');
resetDataBtnPopup.onclick = () => {
  const op = opSelectPopup.value;
  if (!op) return;
  if (!window.confirm('Are you sure you want to reset all extracted data for this data set? This cannot be undone.')) return;
  chrome.runtime.sendMessage({ type: 'resetExtractedData', operationName: op }, () => {
    // Fallback: clear table and show message even if background doesn't respond
    let tableDiv = document.getElementById('operationDataTablePopup');
    if (tableDiv) tableDiv.innerHTML = '<table><thead><tr><th>Name</th><th>Link</th></tr></thead><tbody></tbody></table>';
    if (typeof opDataAreaPopup !== 'undefined' && opDataAreaPopup) {
      opDataAreaPopup.value = '';
    }
    const resetStatus = document.getElementById('resetStatusPopup');
    if (resetStatus) {
      resetStatus.textContent = 'Reset Succeed!';
      setTimeout(() => { resetStatus.textContent = ''; }, 2000);
    }
  });
};

// Listen for reset notification from background and update UI (single handler)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'notify' && msg.success && msg.message && msg.message.startsWith('Extracted data reset for operation:')) {
    // Clear table and textarea instantly, show message below button
    let tableDiv = document.getElementById('operationDataTablePopup');
    if (tableDiv) tableDiv.innerHTML = '<table><thead><tr><th>Name</th><th>Link</th></tr></thead><tbody></tbody></table>';
    if (typeof opDataAreaPopup !== 'undefined' && opDataAreaPopup) {
      opDataAreaPopup.value = '';
    }
    // Show message below reset button
    setTimeout(() => {
      const resetStatus = document.getElementById('resetStatusPopup');
      if (resetStatus) {
        resetStatus.textContent = 'Reset Succeed!';
        setTimeout(() => { resetStatus.textContent = ''; }, 2000);
      }
    }, 0);
  }
});


};


operationList.onchange = () => {
  const name = operationList.value;
  chrome.storage.local.get(['operations'], (data) => {
    operationNameInput.value = name;
    chrome.storage.local.set({ currentOperation: name });
  });
};

startExtractBtn.onclick = () => {
  chrome.storage.local.get(['currentOperation', 'operations'], (data) => {
    const op = data.currentOperation;
    if (!op || !(data.operations && Object.prototype.hasOwnProperty.call(data.operations, op))) {
      statusDiv.textContent = 'Select or create an operation.';
      statusDiv.className = 'error';
      return;
    }
    statusDiv.textContent = 'Extracting...';
    statusDiv.className = '';
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['content.js']
      }, (results) => {
        if (chrome.runtime.lastError) {
          statusDiv.textContent = 'Error injecting script: ' + chrome.runtime.lastError.message;
          statusDiv.className = 'error';
        }
      });
    });
  });
};

document.addEventListener('DOMContentLoaded', loadOperations);

// Listen for status updates from background/content script
chrome.runtime.onMessage.addListener((msg) => {
  console.log('FB Extractor popup received message:', msg);
  if (msg.type === 'updatePopup' || msg.type === 'popupStatus') {
    statusDiv.textContent = msg.message;
    statusDiv.className = msg.success ? 'success' : 'error';
    // Hide extracting if done
    if (msg.success || msg.message) {
      startExtractBtn.disabled = false;
    }
  }
});

// --- Data Set Tab Logic ---
const settingsPanel = document.getElementById('settingsPanel');
const opSelectPopup = document.getElementById('operationSelectPopup');
const loadDataBtnPopup = document.getElementById('loadDataBtnPopup');
const copyDataBtnPopup = document.getElementById('copyDataBtnPopup');
let opDataAreaPopup = document.getElementById('operationDataPopup');
if (!opDataAreaPopup) {
  opDataAreaPopup = document.createElement('textarea');
  opDataAreaPopup.id = 'operationDataPopup';
  opDataAreaPopup.style.display = 'none';
  settingsPanel.appendChild(opDataAreaPopup);
}

function populateDataSetSelect() {
  opSelectPopup.innerHTML = '';
  chrome.storage.local.get(['operations'], (data) => {
    const ops = data.operations || {};
    for (const name in ops) {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      opSelectPopup.appendChild(opt);
    }
  });
}

// Populate on tab switch
dataSetTab.onclick = () => {
  showTab('data');
  populateDataSetSelect();
};

// Also populate on DOMContentLoaded
document.addEventListener('DOMContentLoaded', populateDataSetSelect);

loadDataBtnPopup.onclick = () => {
  const op = opSelectPopup.value;
  if (!op) return;
  const opDataKey = 'extractedData_' + op;
  chrome.storage.local.get([opDataKey], (d) => {
    const arr = d[opDataKey] || [];
    // Show as table
    let html = '<table><thead><tr><th>Name</th><th>Link</th></tr></thead><tbody>';
    arr.forEach(row => {
      html += `<tr><td title="${row.name ? row.name.replace(/"/g,'&quot;') : ''}">${row.name ? row.name.replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''}</td><td title="${row.link}"><a href="${row.link}" target="_blank">${row.link}</a></td></tr>`;
    });
    html += '</tbody></table>';
    let tableDiv = document.getElementById('operationDataTablePopup');
    if (tableDiv) tableDiv.innerHTML = html;
    // For copy button, also update textarea (hidden)
    opDataAreaPopup.value = arr.map(row => `${row.name}\t${row.link}`).join('\n');
  });
};

copyDataBtnPopup.onclick = () => {
  // Always update the textarea with the latest table data
  const op = opSelectPopup.value;
  if (!op) return;
  const opDataKey = 'extractedData_' + op;
  chrome.storage.local.get([opDataKey], (d) => {
    const arr = d[opDataKey] || [];
    opDataAreaPopup.value = arr.map(row => `${row.name}\t${row.link}`).join('\n');
    opDataAreaPopup.style.display = 'block';
    opDataAreaPopup.select();
    document.execCommand('copy');
    opDataAreaPopup.style.display = 'none';
    // Show copy success message
    const copyStatus = document.getElementById('copyStatusPopup');
    if (copyStatus) {
      copyStatus.textContent = 'Copy Successfully!';
      setTimeout(() => { copyStatus.textContent = ''; }, 2000);
    }
  });
};

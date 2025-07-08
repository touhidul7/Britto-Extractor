// Handles operation management and extraction trigger
const operationNameInput = document.getElementById('operationName');
const saveOperationBtn = document.getElementById('saveOperation');
const operationList = document.getElementById('operationList');
const startExtractBtn = document.getElementById('startExtract');
const statusDiv = document.getElementById('status');

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
  const opDataKey = 'extractedData_' + op;
  chrome.storage.local.remove([opDataKey], () => {
    opDataAreaPopup.value = '';
    alert('Extracted data reset for operation: ' + op);
  });
};
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

// --- Settings Panel for Copying Data ---
const openSettingsBtn = document.getElementById('openSettings');
const settingsPanel = document.getElementById('settingsPanel');
const opSelectPopup = document.getElementById('operationSelectPopup');
const loadDataBtnPopup = document.getElementById('loadDataBtnPopup');
const copyDataBtnPopup = document.getElementById('copyDataBtnPopup');
const opDataAreaPopup = document.getElementById('operationDataPopup');

openSettingsBtn.onclick = () => {
  settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
  // Populate operation select
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
};

loadDataBtnPopup.onclick = () => {
  const op = opSelectPopup.value;
  if (!op) return;
  const opDataKey = 'extractedData_' + op;
  chrome.storage.local.get([opDataKey], (d) => {
    const arr = d[opDataKey] || [];
    opDataAreaPopup.value = arr.map(row => `${row.name}\t${row.link}`).join('\n');
  });
};

copyDataBtnPopup.onclick = () => {
  opDataAreaPopup.select();
  document.execCommand('copy');
};

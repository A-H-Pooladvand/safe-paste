/**
 * Popup script - Handle extension settings
 */

// Load current settings
document.addEventListener('DOMContentLoaded', () => {
  const checkbox = document.getElementById('enabledCheckbox');
  const status = document.getElementById('status');
  
  // Load saved setting
  chrome.storage.sync.get(['enabled'], (result) => {
    const isEnabled = result.enabled !== false; // Default to true
    checkbox.checked = isEnabled;
    updateStatus(isEnabled);
  });
  
  // Save setting when changed
  checkbox.addEventListener('change', () => {
    const isEnabled = checkbox.checked;
    chrome.storage.sync.set({ enabled: isEnabled }, () => {
      updateStatus(isEnabled);
    });
  });
  
  function updateStatus(isEnabled) {
    if (isEnabled) {
      status.textContent = '✓ Protection Active';
      status.className = 'status enabled';
    } else {
      status.textContent = '✗ Protection Disabled';
      status.className = 'status disabled';
    }
  }
});

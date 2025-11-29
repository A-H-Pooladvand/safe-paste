/**
 * Options page script - Manage custom keywords
 */

// Load and render keywords on page load
document.addEventListener('DOMContentLoaded', () => {
  loadKeywords();
  
  // Set up event listeners
  document.getElementById('addBtn').addEventListener('click', addKeyword);
  
  // Allow Enter key to add keyword
  document.getElementById('keyword').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addKeyword();
  });
  document.getElementById('replacement').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addKeyword();
  });
});

/**
 * Load keywords from storage and render them
 */
function loadKeywords() {
  chrome.storage.sync.get(['customKeywords'], (result) => {
    const keywords = result.customKeywords || [];
    renderKeywords(keywords);
  });
}

/**
 * Render the keywords list
 */
function renderKeywords(keywords) {
  const listElement = document.getElementById('keywordsList');
  
  if (keywords.length === 0) {
    listElement.innerHTML = '<div class="empty-message">No custom keywords yet. Add one above!</div>';
    return;
  }
  
  listElement.innerHTML = keywords.map((item, index) => `
    <div class="keyword-item">
      <div class="keyword-info">
        <span class="keyword-original">${escapeHtml(item.keyword)}</span>
        <span class="keyword-arrow">→</span>
        <span class="keyword-replacement">${escapeHtml(item.replacement)}</span>
      </div>
      <button class="btn-danger" data-index="${index}">Delete</button>
    </div>
  `).join('');
  
  // Add delete event listeners
  listElement.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      deleteKeyword(index);
    });
  });
}

/**
 * Add a new keyword
 */
function addKeyword() {
  const keywordInput = document.getElementById('keyword');
  const replacementInput = document.getElementById('replacement');
  
  const keyword = keywordInput.value.trim();
  const replacement = replacementInput.value.trim();
  
  // Validation
  if (!keyword) {
    showNotification('Please enter a keyword', 'error');
    keywordInput.focus();
    return;
  }
  
  if (!replacement) {
    showNotification('Please enter a replacement value', 'error');
    replacementInput.focus();
    return;
  }
  
  // Get existing keywords and add new one
  chrome.storage.sync.get(['customKeywords'], (result) => {
    const keywords = result.customKeywords || [];
    
    // Check for duplicate
    if (keywords.some(item => item.keyword.toLowerCase() === keyword.toLowerCase())) {
      showNotification('This keyword already exists', 'error');
      return;
    }
    
    keywords.push({ keyword, replacement });
    
    chrome.storage.sync.set({ customKeywords: keywords }, () => {
      renderKeywords(keywords);
      keywordInput.value = '';
      replacementInput.value = '';
      keywordInput.focus();
      showNotification('Keyword added successfully', 'success');
    });
  });
}

/**
 * Delete a keyword by index
 */
function deleteKeyword(index) {
  chrome.storage.sync.get(['customKeywords'], (result) => {
    const keywords = result.customKeywords || [];
    keywords.splice(index, 1);
    
    chrome.storage.sync.set({ customKeywords: keywords }, () => {
      renderKeywords(keywords);
      showNotification('Keyword deleted', 'success');
    });
  });
}

/**
 * Show notification message
 */
function showNotification(message, type) {
  // Remove existing notification
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

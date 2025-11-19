/**
 * Content script - Intercepts paste events and sanitizes content
 */

// Import sanitizer
const sanitizer = new Sanitizer();

// Track if extension is enabled
let isEnabled = true;

// Load settings from storage
chrome.storage.sync.get(['enabled'], (result) => {
  isEnabled = result.enabled !== false; // Default to true
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.enabled) {
    isEnabled = changes.enabled.newValue;
  }
});

/**
 * Handle paste event
 */
function handlePaste(event) {
  if (!isEnabled) {
    return; // Extension is disabled, allow normal paste
  }

  // Get clipboard data
  const clipboardData = event.clipboardData || window.clipboardData;
  if (!clipboardData) {
    return;
  }

  // Get pasted content
  const pastedText = clipboardData.getData('text');
  if (!pastedText) {
    return;
  }

  // Sanitize the content
  const sanitizedText = sanitizer.sanitize(pastedText);

  // If content was sanitized (changed), prevent default and insert sanitized version
  if (sanitizedText !== pastedText) {
    event.preventDefault();
    
    // Insert sanitized text
    insertSanitizedText(event.target, sanitizedText);
    
    // Show notification
    showNotification();
  }
}

/**
 * Insert sanitized text into the target element
 */
function insertSanitizedText(target, text) {
  // Handle different input types
  if (target.isContentEditable) {
    // ContentEditable element
    document.execCommand('insertText', false, text);
  } else if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    // Input or textarea element
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const currentValue = target.value;
    
    // Insert text at cursor position
    target.value = currentValue.substring(0, start) + text + currentValue.substring(end);
    
    // Set cursor position after inserted text
    target.selectionStart = target.selectionEnd = start + text.length;
    
    // Trigger input event for frameworks that rely on it
    const inputEvent = new Event('input', { bubbles: true });
    target.dispatchEvent(inputEvent);
  } else {
    // Fallback: try to use execCommand
    document.execCommand('insertText', false, text);
  }
}

/**
 * Show brief notification that content was sanitized
 */
function showNotification() {
  // Create notification element
  const notification = document.createElement('div');
  notification.textContent = '🔒 Safe Paste: Sensitive data sanitized';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    animation: slideIn 0.3s ease-out;
  `;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 300);
  }, 3000);
}

// Attach paste event listener to document
document.addEventListener('paste', handlePaste, true);

// Also attach to dynamically created elements (using event delegation)
// This ensures we catch paste events even in dynamically loaded content
document.addEventListener('DOMContentLoaded', () => {
  // Additional setup if needed
});

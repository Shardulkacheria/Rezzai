// Content script for LinkedIn job pages
console.log('RezzAI Content Script Loaded on LinkedIn');

// Wait for page to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  console.log('Initializing RezzAI on LinkedIn job page');
  
  // Check if we're on a LinkedIn job page
  if (window.location.href.includes('linkedin.com/jobs')) {
    createFloatingButton();
  }
}

function createFloatingButton() {
  // Remove existing button if any
  const existingButton = document.getElementById('rezzai-float-button');
  if (existingButton) {
    existingButton.remove();
  }
  
  // Create floating button
  const button = document.createElement('div');
  button.id = 'rezzai-float-button';
  button.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 200px;
    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      Auto-Fill with RezzAI
    </div>
  `;
  
  // Add click handler
  button.addEventListener('click', handleAutoFill);
  
  // Add to page
  document.body.appendChild(button);
  
  console.log('RezzAI floating button created');
}

async function handleAutoFill() {
  console.log('Auto-fill button clicked');
  
  try {
    // Get user data from Chrome storage
    const result = await chrome.storage.local.get(['userData', 'resumePath', 'timestamp']);
    const { userData, resumePath, timestamp } = result;
    
    console.log('Chrome storage result:', result);
    console.log('Storage keys:', Object.keys(result));
    
    if (!userData) {
      console.error('No user data found in Chrome storage');
      console.log('Available storage keys:', Object.keys(result));
      
      // Try to get all storage data
      chrome.storage.local.get(null, (allData) => {
        console.log('All Chrome storage data:', allData);
      });
      
      showNotification('No user data found. Please apply from RezzAI dashboard first.', 'error');
      return;
    }
    
    console.log('User data found:', userData);
    console.log('Data timestamp:', timestamp ? new Date(timestamp).toLocaleString() : 'No timestamp');
    
    // Fill form fields
    await fillFormFields(userData, resumePath);
    
    // Show success message
    showNotification('Form auto-filled successfully! Please review and submit.', 'success');
    
  } catch (error) {
    console.error('Error during auto-fill:', error);
    showNotification('Error during auto-fill. Please try again.', 'error');
  }
}

async function fillFormFields(userData, resumePath) {
  // Wait a bit for LinkedIn's dynamic content to load
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Fill name field
  const nameInput = document.querySelector('input[name="name"], input[placeholder*="name" i], input[aria-label*="name" i]');
  if (nameInput && userData.fullName) {
    nameInput.value = userData.fullName;
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  // Fill email field
  const emailInput = document.querySelector('input[type="email"], input[name="email"], input[placeholder*="email" i]');
  if (emailInput && userData.email) {
    emailInput.value = userData.email;
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  // Fill phone field
  const phoneInput = document.querySelector('input[type="tel"], input[name="phone"], input[placeholder*="phone" i]');
  if (phoneInput && userData.phone) {
    phoneInput.value = userData.phone;
    phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  // Fill location field
  const locationInput = document.querySelector('input[name="location"], input[placeholder*="location" i]');
  if (locationInput && userData.location) {
    locationInput.value = userData.location;
    locationInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  // Fill cover letter/note field
  const coverLetterTextarea = document.querySelector('textarea[name="coverLetter"], textarea[placeholder*="cover letter" i], textarea[placeholder*="note" i]');
  if (coverLetterTextarea && userData.summary) {
    coverLetterTextarea.value = userData.summary;
    coverLetterTextarea.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  // Handle resume upload if available
  if (resumePath) {
    await handleResumeUpload(resumePath);
  }
  
  console.log('Form fields filled successfully');
}

async function handleResumeUpload(resumePath) {
  try {
    // Look for file input
    const fileInput = document.querySelector('input[type="file"], input[accept*="pdf"], input[accept*="docx"]');
    if (fileInput) {
      // Note: Due to browser security restrictions, we can't directly set file input values
      // This would require additional user interaction or a different approach
      console.log('Resume upload field found, but manual upload required due to browser security');
      showNotification('Please manually upload your resume file.', 'info');
    }
  } catch (error) {
    console.error('Error handling resume upload:', error);
  }
}

function showNotification(message, type = 'info') {
  // Remove existing notification
  const existingNotification = document.getElementById('rezzai-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification
  const notification = document.createElement('div');
  notification.id = 'rezzai-notification';
  
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6'
  };
  
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10001;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      max-width: 300px;
      word-wrap: break-word;
    ">
      ${message}
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateButton') {
    createFloatingButton();
    sendResponse({ success: true });
  }
});

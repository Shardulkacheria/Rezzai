// Popup script for RezzAI Chrome Extension
document.addEventListener('DOMContentLoaded', async () => {
  console.log('RezzAI Popup loaded');
  
  // Get DOM elements
  const extensionStatus = document.getElementById('extensionStatus');
  const extensionIndicator = document.getElementById('extensionIndicator');
  const userDataStatus = document.getElementById('userDataStatus');
  const userDataIndicator = document.getElementById('userDataIndicator');
  const currentPage = document.getElementById('currentPage');
  const refreshDataBtn = document.getElementById('refreshData');
  const openDashboardBtn = document.getElementById('openDashboard');
  
  // Check current tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.url.includes('linkedin.com/jobs')) {
      currentPage.textContent = 'LinkedIn Jobs ✓';
    } else {
      currentPage.textContent = 'Not on LinkedIn Jobs';
    }
  } catch (error) {
    console.error('Error checking current tab:', error);
    currentPage.textContent = 'Unknown';
  }
  
  // Check user data status
  await checkUserDataStatus();
  
  // Event listeners
  refreshDataBtn.addEventListener('click', async () => {
    refreshDataBtn.textContent = 'Refreshing...';
    refreshDataBtn.disabled = true;
    
    await checkUserDataStatus();
    
    refreshDataBtn.textContent = 'Refresh Data';
    refreshDataBtn.disabled = false;
  });
  
  openDashboardBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
  });
  
  // Check user data status
  async function checkUserDataStatus() {
    try {
      const result = await chrome.storage.local.get(['userData', 'resumePath', 'timestamp']);
      
      console.log('Popup checking storage:', result);
      
      if (result.userData) {
        userDataStatus.textContent = 'Loaded ✓';
        userDataIndicator.className = 'status-indicator connected';
        
        // Show when data was last updated
        if (result.timestamp) {
          const lastUpdated = new Date(result.timestamp).toLocaleTimeString();
          userDataStatus.textContent = `Loaded ✓ (${lastUpdated})`;
        }
        
        // Show user data in console for debugging
        console.log('User data in popup:', result.userData);
      } else {
        userDataStatus.textContent = 'Not Loaded';
        userDataIndicator.className = 'status-indicator disconnected';
        
        // Show all storage data for debugging
        chrome.storage.local.get(null, (allData) => {
          console.log('All storage data in popup:', allData);
        });
      }
    } catch (error) {
      console.error('Error checking user data:', error);
      userDataStatus.textContent = 'Error';
      userDataIndicator.className = 'status-indicator disconnected';
    }
  }
  
  // Auto-refresh every 5 seconds
  setInterval(checkUserDataStatus, 5000);
});

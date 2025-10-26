// Background script for RezzAI Chrome Extension
console.log('RezzAI Extension Background Script Loaded');

// Listen for messages from the Next.js app
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  console.log('Received external message:', request);
  console.log('Sender:', sender);
  
  if (request.action === 'saveUserData') {
    const { user, resumePath } = request;
    
    console.log('Processing saveUserData request:', { user, resumePath });
    
    // Save user data to Chrome storage
    const dataToStore = {
      userData: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        location: user.location,
        summary: user.summary,
        skills: user.skills,
        experience: user.experience,
        education: user.education,
        projects: user.projects
      },
      resumePath: resumePath,
      timestamp: Date.now()
    };
    
    console.log('Storing data to Chrome storage:', dataToStore);
    
    chrome.storage.local.set(dataToStore, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving to Chrome storage:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log('User data saved to Chrome storage successfully');
        // Verify the data was saved
        chrome.storage.local.get(['userData'], (result) => {
          console.log('Verification - data in storage:', result);
        });
        sendResponse({ success: true });
      }
    });
    
    return true; // Keep the message channel open for async response
  }
  
  if (request.action === 'getUserData') {
    chrome.storage.local.get(['userData', 'resumePath'], (result) => {
      sendResponse({
        userData: result.userData || null,
        resumePath: result.resumePath || null
      });
    });
    return true;
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openLinkedInJob') {
    const { jobUrl } = request;
    
    // Open LinkedIn job in new tab
    chrome.tabs.create({ url: jobUrl }, (tab) => {
      console.log('Opened LinkedIn job:', jobUrl);
      sendResponse({ success: true, tabId: tab.id });
    });
    
    return true;
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('RezzAI Extension installed:', details.reason);
});

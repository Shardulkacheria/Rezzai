// Extension Bridge for RezzAI Chrome Extension Integration
const EXTENSION_ID = 'limnonejcknjkeaoemaadmpjpdmehpoi';

/**
 * Send user data to Chrome extension
 * @param {Object} user - User profile data
 * @param {string} resumePath - Path to resume file
 * @returns {Promise<boolean>} - Success status
 */
export async function sendToExtension(user, resumePath) {
  try {
    // Check if Chrome extension is available
    if (!window.chrome || !window.chrome.runtime) {
      console.warn('Chrome extension not available');
      return false;
    }

    // Prepare user data for extension
    const userData = {
      fullName: user.fullName || user.name || 'Not provided',
      email: user.email || 'Not provided',
      phone: user.phone || 'Not provided',
      location: user.location || 'Not provided',
      summary: user.summary || user.professionalSummary || 'Not provided',
      skills: user.skills || [],
      experience: user.experience || [],
      education: user.education || [],
      projects: user.projects || []
    };

    console.log('Sending user data to extension:', userData);

    // Send message to extension
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(EXTENSION_ID, {
        action: 'saveUserData',
        user: userData,
        resumePath: resumePath
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });

    console.log('User data sent to extension:', response);
    return response?.success || false;

  } catch (error) {
    console.error('Error sending data to extension:', error);
    return false;
  }
}

/**
 * Open LinkedIn job URL in new tab
 * @param {string} jobUrl - LinkedIn job URL
 * @returns {Promise<boolean>} - Success status
 */
export async function openLinkedInJob(jobUrl) {
  try {
    // Check if Chrome extension is available
    if (!window.chrome || !window.chrome.runtime) {
      console.warn('Chrome extension not available, opening in new tab');
      window.open(jobUrl, '_blank');
      return true;
    }

    // Send message to extension to open LinkedIn job
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(EXTENSION_ID, {
        action: 'openLinkedInJob',
        jobUrl: jobUrl
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });

    console.log('LinkedIn job opened:', response);
    return response?.success || false;

  } catch (error) {
    console.error('Error opening LinkedIn job:', error);
    // Fallback to regular window.open
    window.open(jobUrl, '_blank');
    return true;
  }
}

/**
 * Check if Chrome extension is installed and available
 * @returns {boolean} - Extension availability
 */
export function isExtensionAvailable() {
  return !!(window.chrome && window.chrome.runtime);
}

/**
 * Get extension status
 * @returns {Promise<Object>} - Extension status info
 */
export async function getExtensionStatus() {
  try {
    if (!isExtensionAvailable()) {
      return {
        available: false,
        message: 'Chrome extension not installed'
      };
    }

    // Try to ping the extension
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(EXTENSION_ID, {
        action: 'ping'
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });

    return {
      available: true,
      message: 'Extension is ready'
    };

  } catch (error) {
    return {
      available: false,
      message: 'Extension not responding'
    };
  }
}

/**
 * Apply to job with extension integration
 * @param {Object} job - Job object
 * @param {Object} userProfile - User profile data
 * @param {string} resumePath - Resume file path
 * @returns {Promise<boolean>} - Success status
 */
export async function applyToJobWithExtension(job, userProfile, resumePath) {
  try {
    console.log('Applying to job with extension:', job.title);
    console.log('User profile data:', userProfile);
    
    // Send user data to extension
    const dataSent = await sendToExtension(userProfile, resumePath);
    
    if (!dataSent) {
      console.warn('Failed to send data to extension, proceeding with fallback');
    }
    
    // Open LinkedIn job URL
    const jobOpened = await openLinkedInJob(job.applicationUrl || job.jobUrl);
    
    if (jobOpened) {
      console.log('Job application initiated successfully');
      return true;
    } else {
      console.error('Failed to open LinkedIn job');
      return false;
    }
    
  } catch (error) {
    console.error('Error in applyToJobWithExtension:', error);
    return false;
  }
}

/**
 * Test extension connection and data flow
 * @returns {Promise<Object>} - Test results
 */
export async function testExtensionConnection() {
  try {
    console.log('Testing extension connection...');
    
    if (!isExtensionAvailable()) {
      return { success: false, error: 'Chrome extension not available' };
    }
    
    // Test with sample data
    const testData = {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890',
      location: 'Test City',
      summary: 'Test summary',
      skills: ['JavaScript', 'React'],
      experience: [],
      education: [],
      projects: []
    };
    
    const result = await sendToExtension(testData, 'test-resume.docx');
    
    return { success: result, data: testData };
    
  } catch (error) {
    console.error('Extension connection test failed:', error);
    return { success: false, error: error.message };
  }
}

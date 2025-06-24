import { Configuration, PublicClientApplication } from '@azure/msal-browser';

// MSAL configuration
export const msalConfig = {
  auth: {
    // Your actual Client ID from Azure Portal
    clientId: '7a6b8b97-6408-44ec-8937-e18bda589337',
    
    // For Personal Microsoft accounts only (@outlook.com, @hotmail.com, @live.com)
    authority: 'https://login.microsoftonline.com/consumers',
    
    redirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (!containsPii) {
          console.log(`[MSAL ${level}] ${message}`);
        }
      },
      piiLoggingEnabled: false,
      logLevel: 'Info'
    }
  }
};

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Graph API scopes
export const graphScopes = {
  scopes: [
    'https://graph.microsoft.com/Files.ReadWrite',
    'https://graph.microsoft.com/Sites.ReadWrite.All',
    'https://graph.microsoft.com/User.Read'
  ]
};

// Excel workbook configuration
export const excelConfig = {
  workbookId: 'YOUR_WORKBOOK_ID', // Will be set dynamically
  worksheets: {
    projects: 'Projects',
    resources: 'Resources',
    projectLinks: 'ProjectLinks',
    timeEntries: 'TimeEntries',
    managers: 'ProjectManagers'
  }
};
import { Configuration, PublicClientApplication } from '@azure/msal-browser';

// MSAL configuration
export const msalConfig = {
  auth: {
    clientId: 'YOUR_CLIENT_ID', // Replace with your Azure App Registration Client ID
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
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
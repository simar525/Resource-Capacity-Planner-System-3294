# Azure App Registration Setup Guide

## 🔧 Fix for "unauthorized_client" Error

The error occurs because your Azure App Registration is not configured to support personal Microsoft accounts. Here's how to fix it:

## Step 1: Update Your Azure App Registration

1. **Go to Azure Portal**: https://portal.azure.com
2. **Navigate to**: Azure Active Directory → App registrations
3. **Find your app**: "Excel to app integration" (Client ID: 838f42d7-ad47-425d-bb96-f5e9818fb111)
4. **Click on your app** to open its configuration

## Step 2: Change Supported Account Types

1. In your app registration, click on **"Authentication"** in the left sidebar
2. Under **"Supported account types"**, you'll see the current setting
3. **Change it to one of these options**:

   ### Option A: Personal Accounts Only (Recommended for testing)
   - Select: **"Personal Microsoft accounts only"**
   - This allows @outlook.com, @hotmail.com, @live.com accounts
   - Use authority: `https://login.microsoftonline.com/consumers`

   ### Option B: Work/School Accounts Only  
   - Select: **"Accounts in this organizational directory only"**
   - This allows only your organization's accounts
   - Use authority: `https://login.microsoftonline.com/organizations`

   ### Option C: Both Personal and Work Accounts (Most Flexible)
   - Select: **"Accounts in any organizational directory and personal Microsoft accounts"**
   - This allows both types of accounts
   - Use authority: `https://login.microsoftonline.com/common`

4. **Click "Save"** to apply the changes

## Step 3: Update Application Configuration

Based on your choice above, update the authority in your app:

### If you chose Option A (Personal accounts only):
```javascript
// src/config/msalConfig.js
authority: 'https://login.microsoftonline.com/consumers'
```

### If you chose Option B (Work accounts only):
```javascript
// src/config/msalConfig.js  
authority: 'https://login.microsoftonline.com/organizations'
```

### If you chose Option C (Both account types):
```javascript
// src/config/msalConfig.js
authority: 'https://login.microsoftonline.com/common'
```

## Step 4: Verify Redirect URI

1. In Azure Portal, still in your app's "Authentication" section
2. Under **"Platform configurations"**, make sure you have:
   - Platform: **Single-page application (SPA)**
   - Redirect URI: **http://localhost:5173** (for development)
3. If missing, click **"Add a platform"** → **"Single-page application"** → Add the URI

## Step 5: Verify API Permissions

1. Click on **"API permissions"** in the left sidebar
2. Make sure you have these Microsoft Graph permissions:
   - **Files.ReadWrite** (Delegated)
   - **Sites.ReadWrite.All** (Delegated)  
   - **User.Read** (Delegated)
3. If any are missing, click **"Add a permission"** → **"Microsoft Graph"** → **"Delegated permissions"**
4. **Grant admin consent** if required (click the "Grant admin consent" button)

## Step 6: Test the Configuration

1. Save all changes in Azure Portal
2. Wait 2-3 minutes for changes to propagate
3. Try signing in to your app again

## 🎯 Recommended Quick Fix

For immediate testing, I recommend **Option A** (Personal accounts only):

1. In Azure Portal → Your App → Authentication
2. Change to: **"Personal Microsoft accounts only"**  
3. Save changes
4. Your app is already configured for this with the `/consumers` endpoint

## 🔍 Common Issues After Changes

- **Cache Issues**: Clear your browser cache and localStorage
- **Token Issues**: The app will automatically handle new tokens
- **Propagation Delay**: Azure changes can take 2-3 minutes to take effect

## 📞 If You Still Have Issues

1. **Double-check the Client ID** in your app matches Azure exactly
2. **Verify the redirect URI** matches exactly (including http vs https)
3. **Try incognito/private browsing** to avoid cache issues
4. **Wait a few minutes** after making Azure changes

Let me know which option you choose and I'll update the app configuration accordingly!
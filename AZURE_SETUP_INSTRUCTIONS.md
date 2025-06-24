# Create Your Own Azure App Registration

## 🚨 Important: You Need Your Own Client ID

The Client ID `838f42d7-ad47-425d-bb96-f5e9818fb111` in the code is a template placeholder. You need to create your own Azure App Registration.

## Step 1: Create New Azure App Registration

1. **Go to Azure Portal**: https://portal.azure.com
2. **Navigate to**: Azure Active Directory → App registrations
3. **Click**: "New registration"

### Registration Details:
- **Name**: `Excel Capacity Management` (or any name you prefer)
- **Supported account types**: Select **"Personal Microsoft accounts only"**
- **Redirect URI**: 
  - Platform: **Single-page application (SPA)**
  - URI: `http://localhost:5173`

4. **Click "Register"**

## Step 2: Copy Your Client ID

After creating the app, you'll see an **Overview** page with:
- **Application (client) ID**: This is YOUR unique Client ID
- **Copy this ID** - you'll need it in Step 4

## Step 3: Configure API Permissions

1. **Click "API permissions"** in the left sidebar
2. **Click "Add a permission"**
3. **Select "Microsoft Graph"**
4. **Choose "Delegated permissions"**
5. **Add these permissions**:
   - `Files.ReadWrite`
   - `Sites.ReadWrite.All` 
   - `User.Read`
6. **Click "Add permissions"**
7. **Click "Grant admin consent"** (if available)

## Step 4: Update Your App Configuration

Replace the placeholder Client ID with YOUR real Client ID:

```javascript
// In src/config/msalConfig.js
export const msalConfig = {
  auth: {
    clientId: 'YOUR_ACTUAL_CLIENT_ID_HERE', // Replace with your real Client ID
    authority: 'https://login.microsoftonline.com/consumers',
    redirectUri: window.location.origin
  },
  // ... rest of config
};
```

## Step 5: Test Your App

1. **Save the file** with your real Client ID
2. **Restart your development server**: `npm run dev`
3. **Try signing in** with your Microsoft account

## 🎯 What You'll Get

After creating your app registration, you'll have:
- **Your own Client ID** (something like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
- **Proper permissions** for Excel file access
- **Consumer account support** for personal Microsoft accounts

## 📋 Checklist

- [ ] Created new Azure App Registration
- [ ] Copied the Application (client) ID
- [ ] Added Microsoft Graph permissions
- [ ] Updated `msalConfig.js` with real Client ID
- [ ] Restarted development server
- [ ] Tested sign-in

## 🔍 If You Need Help

**Screenshot what you need to copy**: After creating the app, the **Overview** page shows your Client ID. It looks like: `12345678-1234-1234-1234-123456789012`

**Still getting errors?** Make sure:
1. You copied the exact Client ID (no extra spaces)
2. You selected "Personal Microsoft accounts only" 
3. You added the redirect URI as "Single-page application"
4. You restarted your dev server after making changes

Let me know when you have your Client ID and I'll help you update the configuration! 🚀
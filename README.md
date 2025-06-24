# Capacity Management with Excel Integration

A comprehensive capacity management system with real-time Excel synchronization using Microsoft Graph API.

## 🚀 Features

### Core Functionality
- **Project Management**: Create and manage projects with status tracking
- **Resource Management**: Manage team members with skills and allocations  
- **Capacity Planning**: Set percentage-based allocations per project
- **Time Tracking**: Log forecast vs actual hours with variance analysis
- **Analytics & Reporting**: Advanced analytics with predictive insights

### Excel Integration
- **Real-time Sync**: Bidirectional synchronization with Excel Online
- **Auto-sync**: Configurable automatic synchronization every 30 seconds
- **Manual Sync**: On-demand sync controls for immediate updates
- **Secure Authentication**: Microsoft Graph API with OAuth 2.0
- **Cloud Storage**: Data stored securely in OneDrive/SharePoint

## 🔧 Setup Instructions

### 1. Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to "App registrations" → "New registration"
3. Configure:
   - **Name**: Excel to app integration (or your preferred name)
   - **Supported account types**: Choose one of:
     - **Personal Microsoft accounts only** (for personal OneDrive)
     - **Work or school accounts only** (for organizational accounts)
     - **Any Microsoft account** (requires multi-tenant configuration)
   - **Redirect URI**: `http://localhost:5173` (for development)

4. Note down the **Application (client) ID**: `838f42d7-ad47-425d-bb96-f5e9818fb111`

5. Go to "API permissions" → "Add a permission" → "Microsoft Graph"
6. Add these **Delegated permissions**:
   - `Files.ReadWrite`
   - `Sites.ReadWrite.All` 
   - `User.Read`
7. Grant admin consent for the permissions

### 2. Configure Authority Endpoint

Based on your Azure App Registration configuration, choose the correct authority in `src/config/msalConfig.js`:

```javascript
// For PERSONAL Microsoft accounts only (OneDrive personal)
authority: 'https://login.microsoftonline.com/consumers'

// For WORK/SCHOOL accounts only (OneDrive for Business)
authority: 'https://login.microsoftonline.com/organizations'

// For BOTH personal and work accounts (requires multi-tenant app)
authority: 'https://login.microsoftonline.com/common'

// For specific tenant only
authority: 'https://login.microsoftonline.com/YOUR-TENANT-ID'
```

### 3. Multi-Tenant Configuration (Optional)

If you want to support both personal and work accounts:

1. In Azure Portal, go to your App Registration
2. Navigate to "Authentication"
3. Under "Supported account types", select:
   - **"Accounts in any organizational directory and personal Microsoft accounts"**
4. Update your `msalConfig.js` to use:
   ```javascript
   authority: 'https://login.microsoftonline.com/common'
   ```

### 4. Current Configuration

The app is currently configured for **personal Microsoft accounts only**:
- Authority: `https://login.microsoftonline.com/consumers`
- This works with personal OneDrive accounts
- Change to `/organizations` for work accounts or `/common` for both

### 5. Excel Workbook Structure

The application automatically creates these worksheets in Excel:

#### Projects Sheet
| ID | Name | Description | Status | StartDate | EndDate | CreatedBy |

#### Resources Sheet  
| ID | Name | Email | Role | Department | ManagerID | Skills | Avatar |

#### ProjectLinks Sheet
| ID | ProjectID | ResourceID | ManagerID | AllocationPercentage |

#### TimeEntries Sheet
| ID | ResourceID | ProjectID | ManagerID | Date | ForecastHours | ActualHours | Notes |

#### ProjectManagers Sheet
| ID | Name | Email | Department | Avatar |

## 🔐 Authentication Flow

1. **Sign In**: Click "Sign In to Microsoft" to authenticate
2. **Consent**: Grant permissions for file access  
3. **Initialize**: App creates/finds Excel workbook in OneDrive
4. **Sync**: Data automatically synchronizes between app and Excel

## 💡 Usage

### Getting Started
1. Sign in with your Microsoft account
2. Grant necessary permissions
3. The app will create an Excel workbook in your OneDrive
4. Start adding projects, resources, and time entries

### Excel Integration Benefits
- **Offline Access**: Work with data in Excel when offline
- **Familiar Interface**: Use Excel's powerful features for analysis
- **Collaboration**: Share workbooks with team members
- **Backup**: Automatic cloud backup through OneDrive
- **Integration**: Connect with other Excel-based tools and reports

### Data Synchronization
- **Auto-sync**: Enabled by default, syncs every 30 seconds
- **Manual Sync**: Use "Sync from Excel" or "Sync to Excel" buttons
- **Conflict Resolution**: Last write wins (app changes override Excel changes during sync)
- **Real-time Updates**: Changes reflect immediately in both app and Excel

## 🔒 Security

- **OAuth 2.0**: Secure authentication through Microsoft
- **Scoped Permissions**: Minimal required permissions (file access only)
- **Token Management**: Automatic token refresh and secure storage
- **Data Privacy**: Data remains in your OneDrive/organization tenant

## 📊 Data Flow

```
App ←→ Microsoft Graph API ←→ Excel Online ←→ OneDrive/SharePoint
```

- **Create/Update**: App → Graph API → Excel
- **Read/Sync**: Excel → Graph API → App  
- **Real-time**: Automatic bidirectional sync

## 🛠 Development

### Environment Setup
```bash
npm install
npm run dev
```

### Production Deployment
1. Update `redirectUri` in `msalConfig.js` to your production URL
2. Add production URL to Azure App Registration redirect URIs
3. Build and deploy:
```bash
npm run build
```

## 📝 API Permissions

The app requires these Microsoft Graph permissions:
- **Files.ReadWrite**: Read and write access to user files
- **Sites.ReadWrite.All**: Read and write access to SharePoint sites  
- **User.Read**: Read user profile information

## 🔍 Troubleshooting

### Common Issues

**1. AADSTS50194 Error (Multi-tenant Issue)**
- **Problem**: App configured as single-tenant but using `/common` endpoint
- **Solution**: Update `authority` in `msalConfig.js`:
  - For personal accounts: `https://login.microsoftonline.com/consumers`
  - For work accounts: `https://login.microsoftonline.com/organizations`
  - For both: Configure app as multi-tenant in Azure Portal

**2. Authentication Failed**
- Verify Client ID in `msalConfig.js`
- Check Azure App Registration configuration  
- Ensure redirect URI matches exactly
- Verify account type matches authority endpoint

**3. Excel Connection Error**
- Verify OneDrive access permissions
- Check if Excel Online is available in your tenant
- Try manual connection initialization

**4. Sync Issues**
- Check internet connectivity
- Verify Excel workbook isn't open in desktop Excel
- Try manual sync buttons

**5. Permission Denied**  
- Re-authenticate and grant all requested permissions
- Contact admin if in organizational tenant

### Debug Mode

Enable debug logging by setting:
```javascript
// In msalConfig.js
export const msalConfig = {
  // ... other config
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: 'Verbose'
    }
  }
};
```

## 📈 Advanced Features

- **Predictive Analytics**: AI-powered capacity forecasting
- **Utilization Heatmaps**: Visual capacity analysis
- **Burnout Detection**: Resource overallocation alerts  
- **Variance Analysis**: Forecast vs actual time tracking
- **Multi-tenant Support**: Works with personal and organizational accounts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test Excel integration thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
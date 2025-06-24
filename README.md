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
   - **Name**: Capacity Management App
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: `http://localhost:5173` (for development)

4. Note down the **Application (client) ID**

5. Go to "API permissions" → "Add a permission" → "Microsoft Graph"
6. Add these **Delegated permissions**:
   - `Files.ReadWrite`
   - `Sites.ReadWrite.All`
   - `User.Read`

7. Grant admin consent for the permissions

### 2. Configure the Application

1. Open `src/config/msalConfig.js`
2. Replace `YOUR_CLIENT_ID` with your Azure App Registration Client ID:

```javascript
export const msalConfig = {
  auth: {
    clientId: 'your-actual-client-id-here',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin
  }
};
```

### 3. Excel Workbook Structure

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

**1. Authentication Failed**
- Verify Client ID in `msalConfig.js`
- Check Azure App Registration configuration
- Ensure redirect URI matches exactly

**2. Excel Connection Error**
- Verify OneDrive access permissions
- Check if Excel Online is available in your tenant
- Try manual connection initialization

**3. Sync Issues**
- Check internet connectivity
- Verify Excel workbook isn't open in desktop Excel
- Try manual sync buttons

**4. Permission Denied**
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
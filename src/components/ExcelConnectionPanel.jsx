import React from 'react';
import { useExcel } from '../context/ExcelContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCloud, FiCloudOff, FiRefreshCw, FiCheck, FiAlert, FiSettings, FiLogIn, FiLogOut, FiExternalLink, FiInfo, FiTestTube, FiPlay } = FiIcons;

function ExcelConnectionPanel() {
  const {
    isAuthenticated,
    isConnected,
    isLoading,
    error,
    lastSync,
    autoSyncEnabled,
    debugInfo,
    msalInitialized,
    setAutoSyncEnabled,
    signIn,
    signOut,
    syncFromExcel,
    syncToExcel,
    initializeExcelConnection
  } = useExcel();

  const getStatusIcon = () => {
    if (isLoading) return FiRefreshCw;
    if (error) return FiAlert;
    if (isConnected) return FiCloud;
    return FiCloudOff;
  };

  const getStatusColor = () => {
    if (isLoading) return 'text-blue-500';
    if (error) return 'text-red-500';
    if (isConnected) return 'text-green-500';
    return 'text-gray-400';
  };

  const getStatusText = () => {
    if (!msalInitialized) return 'Initializing...';
    if (isLoading) return 'Connecting...';
    if (error) return 'Connection Error';
    if (isConnected) return 'Connected to Excel';
    if (isAuthenticated) return 'Excel Not Connected';
    return 'Not Signed In';
  };

  const testConnection = async () => {
    console.log('🧪 Testing connection manually...');
    try {
      await initializeExcelConnection();
    } catch (err) {
      console.error('❌ Test connection failed:', err);
    }
  };

  // Debug: log current state
  console.log('🔍 Excel Panel State:', {
    msalInitialized,
    isAuthenticated,
    isConnected,
    isLoading,
    error,
    debugInfo
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <SafeIcon icon={getStatusIcon()} className={`h-6 w-6 ${getStatusColor()} ${isLoading ? 'animate-spin' : ''}`} />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Excel Integration</h3>
            <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <SafeIcon icon={FiLogOut} className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={signIn}
              disabled={isLoading || !msalInitialized}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <SafeIcon icon={FiLogIn} className="h-4 w-4" />
              <span>{!msalInitialized ? 'Initializing...' : 'Sign In to Microsoft'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Show debug info about authentication state */}
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-xs text-gray-600">
          <p><strong>Debug Info:</strong></p>
          <p>• MSAL Initialized: {msalInitialized ? 'Yes' : 'No'}</p>
          <p>• Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p>• Connected: {isConnected ? 'Yes' : 'No'}</p>
          <p>• Loading: {isLoading ? 'Yes' : 'No'}</p>
          {debugInfo?.account && <p>• Account: {debugInfo.account}</p>}
          {error && <p>• Error: {error}</p>}
        </div>
      </div>

      {/* Show initialization status */}
      {!msalInitialized && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiRefreshCw} className="h-4 w-4 text-blue-500 animate-spin" />
            <span className="text-sm font-medium text-blue-800">Initializing Authentication System...</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">Please wait while we set up the Microsoft authentication system.</p>
        </div>
      )}

      {/* Connection controls - only show when MSAL is initialized */}
      {msalInitialized && (isAuthenticated || debugInfo?.account) && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-3">Excel Connection Controls</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={initializeExcelConnection}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <SafeIcon icon={FiPlay} className="h-4 w-4" />
              <span>Initialize Excel Connection</span>
            </button>
            <button
              onClick={testConnection}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <SafeIcon icon={FiTestTube} className="h-4 w-4" />
              <span>Debug Test</span>
            </button>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            💡 Click "Initialize Excel Connection" to create the workbook in your OneDrive
          </p>
        </div>
      )}

      {/* Troubleshooting for when MSAL is initialized but no auth detected */}
      {msalInitialized && !isAuthenticated && !debugInfo?.account && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-800 mb-3">Ready to Connect</h4>
          <p className="text-sm text-yellow-700 mb-3">
            Authentication system is ready. Click "Sign In to Microsoft" above to get started.
          </p>
          <div className="space-y-2">
            <button
              onClick={signIn}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm disabled:opacity-50"
            >
              <SafeIcon icon={FiPlay} className="h-4 w-4" />
              <span>Force Sign In</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <SafeIcon icon={FiAlert} className="h-4 w-4 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Connection Error</p>
              <p className="text-sm text-red-700">{error}</p>
              {msalInitialized && (
                <div className="mt-2 space-x-2">
                  <button
                    onClick={initializeExcelConnection}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Retry Connection
                  </button>
                  <button
                    onClick={testConnection}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Debug Test
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Debug Information */}
      {debugInfo && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <SafeIcon icon={FiInfo} className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Debug Information</p>
              <p className="text-blue-700">Account: {debugInfo.account}</p>
              {debugInfo.workbookId && (
                <div className="mt-1">
                  <p className="text-blue-700">Workbook ID: {debugInfo.workbookId.substring(0, 20)}...</p>
                  <div className="mt-2 space-x-2">
                    <a
                      href="https://onedrive.live.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <span>Open OneDrive</span>
                      <SafeIcon icon={FiExternalLink} className="h-3 w-3" />
                    </a>
                    <a
                      href={`https://onedrive.live.com/edit.aspx?resid=${debugInfo.workbookId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-green-600 hover:text-green-800 font-medium"
                    >
                      <span>Open Excel File</span>
                      <SafeIcon icon={FiExternalLink} className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {msalInitialized && (isAuthenticated || debugInfo?.account) && (
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={isConnected ? FiCheck : FiCloudOff} className={`h-4 w-4 ${isConnected ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="text-sm font-medium text-gray-700">
                  {isConnected ? 'Excel Connected' : 'Excel Disconnected'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiRefreshCw} className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {lastSync ? `Last sync: ${lastSync.toLocaleTimeString()}` : 'Never synced'}
                </span>
              </div>
            </div>
          </div>

          {/* Auto-sync Toggle */}
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiSettings} className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Auto-sync with Excel</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSyncEnabled}
                onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Manual Sync Controls */}
          {isConnected && (
            <div className="flex space-x-2">
              <button
                onClick={syncFromExcel}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <SafeIcon icon={FiRefreshCw} className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Sync from Excel</span>
              </button>
              <button
                onClick={() => syncToExcel()}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <SafeIcon icon={FiRefreshCw} className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Sync to Excel</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Features List */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Excel Integration Features</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiCheck} className="h-3 w-3 text-green-500" />
            <span>Real-time bidirectional sync</span>
          </div>
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiCheck} className="h-3 w-3 text-green-500" />
            <span>Automatic worksheet creation</span>
          </div>
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiCheck} className="h-3 w-3 text-green-500" />
            <span>Secure Microsoft authentication</span>
          </div>
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiCheck} className="h-3 w-3 text-green-500" />
            <span>Cloud storage in OneDrive</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {msalInitialized && !(isAuthenticated || debugInfo?.account) && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Getting Started</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>1. Click "Sign In to Microsoft" above</p>
            <p>2. Grant permissions when prompted</p>
            <p>3. Then click "Initialize Excel Connection"</p>
            <p>4. Check OneDrive for your new Excel file</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExcelConnectionPanel;
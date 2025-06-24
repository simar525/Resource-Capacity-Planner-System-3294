import React from 'react';
import { useExcel } from '../context/ExcelContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCloud, FiCloudOff, FiRefreshCw, FiCheck, FiAlert, FiSettings, FiLogIn, FiLogOut } = FiIcons;

function ExcelConnectionPanel() {
  const {
    isAuthenticated,
    isConnected,
    isLoading,
    error,
    lastSync,
    autoSyncEnabled,
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
    if (isLoading) return 'Connecting...';
    if (error) return 'Connection Error';
    if (isConnected) return 'Connected to Excel';
    if (isAuthenticated) return 'Excel Not Connected';
    return 'Not Signed In';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <SafeIcon 
            icon={getStatusIcon()} 
            className={`h-6 w-6 ${getStatusColor()} ${isLoading ? 'animate-spin' : ''}`} 
          />
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
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <SafeIcon icon={FiLogIn} className="h-4 w-4" />
              <span>Sign In to Microsoft</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <SafeIcon icon={FiAlert} className="h-4 w-4 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Connection Error</p>
              <p className="text-sm text-red-700">{error}</p>
              {isAuthenticated && (
                <button
                  onClick={initializeExcelConnection}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Retry Connection
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <SafeIcon 
                  icon={isConnected ? FiCheck : FiCloudOff} 
                  className={`h-4 w-4 ${isConnected ? 'text-green-500' : 'text-gray-400'}`} 
                />
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

          {/* Setup Instructions */}
          {isAuthenticated && !isConnected && !error && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Setup Required</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>1. Ensure you have an Excel file in your OneDrive</p>
                <p>2. The app will create worksheets automatically</p>
                <p>3. Grant necessary permissions when prompted</p>
              </div>
              <button
                onClick={initializeExcelConnection}
                disabled={isLoading}
                className="mt-3 flex items-center space-x-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                <SafeIcon icon={FiRefreshCw} className="h-4 w-4" />
                <span>Initialize Excel Connection</span>
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
    </div>
  );
}

export default ExcelConnectionPanel;
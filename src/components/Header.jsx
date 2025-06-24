import React from 'react';
import SafeIcon from '../common/SafeIcon';
import { useExcel } from '../context/ExcelContext';
import * as FiIcons from 'react-icons/fi';

const { FiBell, FiSearch, FiUser, FiCloud, FiCloudOff, FiRefreshCw } = FiIcons;

function Header() {
  const { isConnected, isLoading, lastSync } = useExcel();

  const getExcelStatusIcon = () => {
    if (isLoading) return FiRefreshCw;
    if (isConnected) return FiCloud;
    return FiCloudOff;
  };

  const getExcelStatusColor = () => {
    if (isLoading) return 'text-blue-500';
    if (isConnected) return 'text-green-500';
    return 'text-gray-400';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 max-w-lg">
          <div className="relative w-full">
            <SafeIcon 
              icon={FiSearch} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" 
            />
            <input
              type="text"
              placeholder="Search resources, projects..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Excel Connection Status */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
            <SafeIcon 
              icon={getExcelStatusIcon()} 
              className={`h-4 w-4 ${getExcelStatusColor()} ${isLoading ? 'animate-spin' : ''}`} 
            />
            <div className="text-xs">
              <div className={`font-medium ${getExcelStatusColor()}`}>
                {isConnected ? 'Excel Connected' : 'Excel Offline'}
              </div>
              {lastSync && (
                <div className="text-gray-500">
                  {lastSync.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <SafeIcon icon={FiBell} className="h-5 w-5" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiUser} className="h-4 w-4 text-primary-600" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">Project Manager</p>
              <p className="text-xs text-gray-500">manager@company.com</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
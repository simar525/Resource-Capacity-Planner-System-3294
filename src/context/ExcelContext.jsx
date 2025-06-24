import React, { createContext, useContext, useState, useEffect } from 'react';
import { msalInstance, graphScopes } from '../config/msalConfig';
import graphService from '../services/graphService';

const ExcelContext = createContext();

export function ExcelProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);
  const [msalInitialized, setMsalInitialized] = useState(false);

  // Initialize MSAL on mount
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        console.log('🔧 Initializing MSAL...');
        await msalInstance.initialize();
        console.log('✅ MSAL initialized successfully');
        setMsalInitialized(true);
        
        // Check for existing authentication after initialization
        const accounts = msalInstance.getAllAccounts();
        console.log('🔍 MSAL Accounts found:', accounts.length);
        
        if (accounts.length > 0) {
          console.log('👤 Found existing account:', accounts[0].username);
          setIsAuthenticated(true);
          setDebugInfo(prev => ({
            ...prev,
            account: accounts[0].username,
            accountId: accounts[0].homeAccountId
          }));
        }
      } catch (error) {
        console.error('❌ Failed to initialize MSAL:', error);
        setError(`Failed to initialize authentication: ${error.message}`);
      }
    };

    initializeMsal();
  }, []);

  // Auto-sync interval (every 30 seconds when enabled)
  useEffect(() => {
    if (autoSyncEnabled && isConnected) {
      const interval = setInterval(() => {
        syncFromExcel();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoSyncEnabled, isConnected]);

  // Sign in to Microsoft account
  const signIn = async () => {
    if (!msalInitialized) {
      setError('Authentication system is still initializing. Please wait a moment and try again.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('🔐 Starting Microsoft sign-in...');
      
      const loginResponse = await msalInstance.loginPopup(graphScopes);
      console.log('✅ Login successful:', loginResponse.account.username);
      
      setIsAuthenticated(true);
      setDebugInfo(prev => ({
        ...prev,
        account: loginResponse.account.username,
        accountId: loginResponse.account.homeAccountId,
        scopes: loginResponse.scopes
      }));
      
      console.log('✅ Sign-in complete. Ready to initialize Excel connection.');
    } catch (error) {
      console.error('❌ Login failed:', error);
      setError(`Failed to sign in: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await msalInstance.logoutPopup({
          account: accounts[0]
        });
      }
      setIsAuthenticated(false);
      setIsConnected(false);
      setLastSync(null);
      setDebugInfo(null);
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Even if logout fails, clear local state
      setIsAuthenticated(false);
      setIsConnected(false);
      setLastSync(null);
      setDebugInfo(null);
    }
  };

  // Initialize Excel workbook connection
  const initializeExcelConnection = async () => {
    if (!msalInitialized) {
      setError('Authentication system is still initializing. Please wait a moment and try again.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('📊 Initializing Excel connection...');
      
      const workbookId = await graphService.initializeWorkbook();
      console.log('✅ Excel workbook initialized:', workbookId);
      
      setIsConnected(true);
      setLastSync(new Date());
      setDebugInfo(prev => ({
        ...prev,
        workbookId,
        workbookUrl: `https://onedrive.live.com/edit.aspx?resid=${workbookId}`
      }));
      
      console.log('🎉 Excel connection successful! Check OneDrive for CapacityManagement.xlsx');
    } catch (error) {
      console.error('❌ Failed to initialize Excel connection:', error);
      setError(`Failed to connect to Excel: ${error.message}. Please check your OneDrive permissions.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync data from Excel to app
  const syncFromExcel = async () => {
    if (!msalInitialized) {
      console.warn('⚠️ MSAL not initialized, skipping sync');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('⬇️ Syncing from Excel...');
      
      const data = await graphService.syncFromExcel();
      setLastSync(new Date());
      
      // Dispatch custom event to notify context to update data
      window.dispatchEvent(new CustomEvent('excel-data-updated', { detail: data }));
      console.log('✅ Sync from Excel completed');
      return data;
    } catch (error) {
      console.error('❌ Failed to sync from Excel:', error);
      setError(`Failed to sync data from Excel: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sync data from app to Excel
  const syncToExcel = async (data) => {
    if (!msalInitialized) {
      console.warn('⚠️ MSAL not initialized, skipping sync');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('⬆️ Syncing to Excel...');
      
      await graphService.syncToExcel(data);
      setLastSync(new Date());
      console.log('✅ Sync to Excel completed');
    } catch (error) {
      console.error('❌ Failed to sync to Excel:', error);
      setError(`Failed to sync data to Excel: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add single item to Excel
  const addToExcel = async (worksheetName, data) => {
    if (!msalInitialized) {
      console.warn('⚠️ MSAL not initialized, skipping add operation');
      return;
    }

    try {
      await graphService.addWorksheetRow(worksheetName, data);
      setLastSync(new Date());
    } catch (error) {
      console.error(`❌ Failed to add to Excel worksheet ${worksheetName}:`, error);
      throw error;
    }
  };

  // Update single item in Excel
  const updateInExcel = async (worksheetName, data, idField = 'ID') => {
    if (!msalInitialized) {
      console.warn('⚠️ MSAL not initialized, skipping update operation');
      return;
    }

    try {
      await graphService.updateWorksheetRow(worksheetName, data, idField);
      setLastSync(new Date());
    } catch (error) {
      console.error(`❌ Failed to update Excel worksheet ${worksheetName}:`, error);
      throw error;
    }
  };

  // Delete single item from Excel
  const deleteFromExcel = async (worksheetName, id, idField = 'ID') => {
    if (!msalInitialized) {
      console.warn('⚠️ MSAL not initialized, skipping delete operation');
      return;
    }

    try {
      await graphService.deleteWorksheetRow(worksheetName, id, idField);
      setLastSync(new Date());
    } catch (error) {
      console.error(`❌ Failed to delete from Excel worksheet ${worksheetName}:`, error);
      throw error;
    }
  };

  const value = {
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
    initializeExcelConnection,
    syncFromExcel,
    syncToExcel,
    addToExcel,
    updateInExcel,
    deleteFromExcel
  };

  return (
    <ExcelContext.Provider value={value}>
      {children}
    </ExcelContext.Provider>
  );
}

export function useExcel() {
  const context = useContext(ExcelContext);
  if (!context) {
    throw new Error('useExcel must be used within an ExcelProvider');
  }
  return context;
}
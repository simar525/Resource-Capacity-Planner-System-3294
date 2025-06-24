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

  // Check authentication status on mount
  useEffect(() => {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      setIsAuthenticated(true);
      initializeExcelConnection();
    }
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
    try {
      setIsLoading(true);
      setError(null);

      const loginResponse = await msalInstance.loginPopup(graphScopes);
      setIsAuthenticated(true);
      
      // Initialize Excel connection after successful login
      await initializeExcelConnection();
    } catch (error) {
      console.error('Login failed:', error);
      setError('Failed to sign in to Microsoft account');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await msalInstance.logout();
      setIsAuthenticated(false);
      setIsConnected(false);
      setLastSync(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Initialize Excel workbook connection
  const initializeExcelConnection = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await graphService.initializeWorkbook();
      setIsConnected(true);
      setLastSync(new Date());
    } catch (error) {
      console.error('Failed to initialize Excel connection:', error);
      setError('Failed to connect to Excel. Please ensure you have an Excel file in OneDrive.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sync data from Excel to app
  const syncFromExcel = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await graphService.syncFromExcel();
      setLastSync(new Date());
      
      // Dispatch custom event to notify context to update data
      window.dispatchEvent(new CustomEvent('excel-data-updated', { detail: data }));
      
      return data;
    } catch (error) {
      console.error('Failed to sync from Excel:', error);
      setError('Failed to sync data from Excel');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sync data from app to Excel
  const syncToExcel = async (data) => {
    try {
      setIsLoading(true);
      setError(null);

      await graphService.syncToExcel(data);
      setLastSync(new Date());
    } catch (error) {
      console.error('Failed to sync to Excel:', error);
      setError('Failed to sync data to Excel');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add single item to Excel
  const addToExcel = async (worksheetName, data) => {
    try {
      await graphService.addWorksheetRow(worksheetName, data);
      setLastSync(new Date());
    } catch (error) {
      console.error(`Failed to add to Excel worksheet ${worksheetName}:`, error);
      throw error;
    }
  };

  // Update single item in Excel
  const updateInExcel = async (worksheetName, data, idField = 'ID') => {
    try {
      await graphService.updateWorksheetRow(worksheetName, data, idField);
      setLastSync(new Date());
    } catch (error) {
      console.error(`Failed to update Excel worksheet ${worksheetName}:`, error);
      throw error;
    }
  };

  // Delete single item from Excel
  const deleteFromExcel = async (worksheetName, id, idField = 'ID') => {
    try {
      await graphService.deleteWorksheetRow(worksheetName, id, idField);
      setLastSync(new Date());
    } catch (error) {
      console.error(`Failed to delete from Excel worksheet ${worksheetName}:`, error);
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
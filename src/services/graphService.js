import { Client } from '@microsoft/microsoft-graph-client';
import { msalInstance } from '../config/msalConfig';

class GraphService {
  constructor() {
    this.graphClient = null;
    this.workbookId = null;
  }

  // Initialize Graph client with authentication
  async initializeGraphClient() {
    try {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length === 0) {
        throw new Error('No authenticated accounts found');
      }

      console.log('🔐 Found account:', accounts[0].username);
      console.log('🔐 Account type:', accounts[0].idTokenClaims?.tid ? 'Work/School' : 'Personal');

      const silentRequest = {
        scopes: [
          'https://graph.microsoft.com/Files.ReadWrite',
          'https://graph.microsoft.com/Sites.ReadWrite.All',
          'https://graph.microsoft.com/User.Read'
        ],
        account: accounts[0]
      };

      console.log('🔑 Acquiring token...');
      const response = await msalInstance.acquireTokenSilent(silentRequest);
      console.log('✅ Token acquired successfully');

      this.graphClient = Client.init({
        authProvider: (done) => {
          done(null, response.accessToken);
        }
      });

      // Test the connection
      const userInfo = await this.graphClient.api('/me').get();
      console.log('👤 Connected as:', userInfo.displayName, userInfo.userPrincipalName);

      return this.graphClient;
    } catch (error) {
      console.error('❌ Failed to initialize Graph client:', error);
      throw error;
    }
  }

  // Create or get Excel workbook
  async initializeWorkbook(workbookName = 'CapacityManagement.xlsx') {
    try {
      if (!this.graphClient) {
        await this.initializeGraphClient();
      }

      console.log('🔍 Looking for existing workbook:', workbookName);

      // First, try to find existing workbook
      const driveItems = await this.graphClient
        .api('/me/drive/root/children')
        .filter(`name eq '${workbookName}'`)
        .get();

      console.log('📁 Drive items found:', driveItems.value.length);

      if (driveItems.value.length > 0) {
        this.workbookId = driveItems.value[0].id;
        console.log('📋 Found existing workbook:', this.workbookId);
        console.log('🌐 Workbook URL:', `https://onedrive.live.com/edit.aspx?resid=${this.workbookId}`);
      } else {
        // Create new workbook
        console.log('🆕 Creating new workbook...');
        const newWorkbook = await this.createWorkbook(workbookName);
        this.workbookId = newWorkbook.id;
        console.log('✅ Created new workbook:', this.workbookId);
        console.log('🌐 New workbook URL:', `https://onedrive.live.com/edit.aspx?resid=${this.workbookId}`);
      }

      // Initialize worksheets
      console.log('📊 Initializing worksheets...');
      await this.initializeWorksheets();
      console.log('✅ Worksheets initialized successfully');

      return this.workbookId;
    } catch (error) {
      console.error('❌ Failed to initialize workbook:', error);
      
      // More detailed error information
      if (error.message.includes('Forbidden')) {
        console.error('📛 Permission Error: Check if your account has OneDrive access');
      } else if (error.message.includes('Unauthorized')) {
        console.error('🚫 Authentication Error: Token might be invalid');
      } else if (error.message.includes('NotFound')) {
        console.error('🔍 Not Found: Drive or folder not accessible');
      }
      
      throw error;
    }
  }

  // Create new Excel workbook
  async createWorkbook(name) {
    try {
      console.log('📝 Creating workbook with name:', name);
      
      // Create an empty Excel file
      const workbook = {
        name: name,
        file: {},
        '@microsoft.graph.conflictBehavior': 'rename'
      };

      const response = await this.graphClient
        .api('/me/drive/root/children')
        .post(workbook);

      console.log('✅ Workbook created successfully:', response.id);
      return response;
    } catch (error) {
      console.error('❌ Failed to create workbook:', error);
      throw error;
    }
  }

  // Initialize all required worksheets
  async initializeWorksheets() {
    const worksheets = [
      {
        name: 'Projects',
        headers: ['ID', 'Name', 'Description', 'Status', 'StartDate', 'EndDate', 'CreatedBy']
      },
      {
        name: 'Resources',
        headers: ['ID', 'Name', 'Email', 'Role', 'Department', 'ManagerID', 'Skills', 'Avatar']
      },
      {
        name: 'ProjectLinks',
        headers: ['ID', 'ProjectID', 'ResourceID', 'ManagerID', 'AllocationPercentage']
      },
      {
        name: 'TimeEntries',
        headers: ['ID', 'ResourceID', 'ProjectID', 'ManagerID', 'Date', 'ForecastHours', 'ActualHours', 'Notes']
      },
      {
        name: 'ProjectManagers',
        headers: ['ID', 'Name', 'Email', 'Department', 'Avatar']
      }
    ];

    for (const worksheet of worksheets) {
      console.log(`📋 Processing worksheet: ${worksheet.name}`);
      await this.createWorksheet(worksheet.name, worksheet.headers);
    }
  }

  // Create worksheet with headers
  async createWorksheet(name, headers) {
    try {
      console.log(`🔍 Checking if worksheet '${name}' exists...`);
      
      // Check if worksheet exists
      const existingWorksheets = await this.graphClient
        .api(`/me/drive/items/${this.workbookId}/workbook/worksheets`)
        .get();

      const exists = existingWorksheets.value.some(ws => ws.name === name);
      console.log(`📋 Worksheet '${name}' exists:`, exists);

      if (!exists) {
        console.log(`🆕 Creating worksheet: ${name}`);
        
        // Create worksheet
        const worksheet = await this.graphClient
          .api(`/me/drive/items/${this.workbookId}/workbook/worksheets`)
          .post({ name });

        console.log(`✅ Created worksheet: ${name}`);

        // Add headers
        const range = `${name}!A1:${String.fromCharCode(64 + headers.length)}1`;
        console.log(`📝 Adding headers to range: ${range}`);
        
        await this.graphClient
          .api(`/me/drive/items/${this.workbookId}/workbook/worksheets/${name}/range(address='${range}')`)
          .patch({
            values: [headers]
          });

        console.log(`✅ Headers added to worksheet: ${name}`);
      } else {
        console.log(`✅ Worksheet '${name}' already exists`);
      }
    } catch (error) {
      console.error(`❌ Failed to create worksheet ${name}:`, error);
      
      // Don't throw error for worksheet creation failures, just log them
      if (error.message.includes('InvalidRequest')) {
        console.warn(`⚠️ Worksheet '${name}' might already exist or have invalid name`);
      }
    }
  }

  // Test drive access
  async testDriveAccess() {
    try {
      console.log('🧪 Testing drive access...');
      
      const drive = await this.graphClient.api('/me/drive').get();
      console.log('✅ Drive access successful:', drive.driveType, drive.id);
      
      const rootItems = await this.graphClient.api('/me/drive/root/children').get();
      console.log('📁 Root items count:', rootItems.value.length);
      
      return true;
    } catch (error) {
      console.error('❌ Drive access failed:', error);
      return false;
    }
  }

  // Generic method to read data from worksheet
  async readWorksheetData(worksheetName) {
    try {
      const response = await this.graphClient
        .api(`/me/drive/items/${this.workbookId}/workbook/worksheets/${worksheetName}/usedRange`)
        .get();

      if (!response || !response.values || response.values.length <= 1) {
        return [];
      }

      const headers = response.values[0];
      const rows = response.values.slice(1);

      return rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });
    } catch (error) {
      console.error(`Failed to read worksheet ${worksheetName}:`, error);
      return [];
    }
  }

  // Generic method to write data to worksheet
  async writeWorksheetData(worksheetName, data) {
    try {
      if (!data || data.length === 0) return;

      // Clear existing data (except headers)
      await this.graphClient
        .api(`/me/drive/items/${this.workbookId}/workbook/worksheets/${worksheetName}/range(address='A2:Z1000')`)
        .patch({ values: [['']] });

      // Prepare data for Excel
      const headers = Object.keys(data[0]);
      const values = data.map(item =>
        headers.map(header => {
          const value = item[header];
          if (Array.isArray(value)) {
            return JSON.stringify(value);
          }
          return value || '';
        })
      );

      // Write data starting from row 2 (after headers)
      const range = `${worksheetName}!A2:${String.fromCharCode(64 + headers.length)}${values.length + 1}`;
      await this.graphClient
        .api(`/me/drive/items/${this.workbookId}/workbook/worksheets/${worksheetName}/range(address='${range}')`)
        .patch({ values });

      console.log(`Updated worksheet: ${worksheetName} with ${data.length} records`);
    } catch (error) {
      console.error(`Failed to write to worksheet ${worksheetName}:`, error);
      throw error;
    }
  }

  // Add single row to worksheet
  async addWorksheetRow(worksheetName, data) {
    try {
      // Get current data to find next row
      const existingData = await this.readWorksheetData(worksheetName);
      const nextRow = existingData.length + 2; // +2 for header row and 1-based indexing

      const headers = Object.keys(data);
      const values = headers.map(header => {
        const value = data[header];
        if (Array.isArray(value)) {
          return JSON.stringify(value);
        }
        return value || '';
      });

      const range = `${worksheetName}!A${nextRow}:${String.fromCharCode(64 + headers.length)}${nextRow}`;
      await this.graphClient
        .api(`/me/drive/items/${this.workbookId}/workbook/worksheets/${worksheetName}/range(address='${range}')`)
        .patch({ values: [values] });

      console.log(`Added row to worksheet: ${worksheetName}`);
    } catch (error) {
      console.error(`Failed to add row to worksheet ${worksheetName}:`, error);
      throw error;
    }
  }

  // Update specific row in worksheet
  async updateWorksheetRow(worksheetName, rowData, idField = 'ID') {
    try {
      const existingData = await this.readWorksheetData(worksheetName);
      const rowIndex = existingData.findIndex(item => item[idField] == rowData[idField]);

      if (rowIndex === -1) {
        throw new Error(`Row with ${idField} ${rowData[idField]} not found`);
      }

      const actualRowNumber = rowIndex + 2; // +2 for header row and 1-based indexing
      const headers = Object.keys(rowData);
      const values = headers.map(header => {
        const value = rowData[header];
        if (Array.isArray(value)) {
          return JSON.stringify(value);
        }
        return value || '';
      });

      const range = `${worksheetName}!A${actualRowNumber}:${String.fromCharCode(64 + headers.length)}${actualRowNumber}`;
      await this.graphClient
        .api(`/me/drive/items/${this.workbookId}/workbook/worksheets/${worksheetName}/range(address='${range}')`)
        .patch({ values: [values] });

      console.log(`Updated row in worksheet: ${worksheetName}`);
    } catch (error) {
      console.error(`Failed to update row in worksheet ${worksheetName}:`, error);
      throw error;
    }
  }

  // Delete row from worksheet
  async deleteWorksheetRow(worksheetName, id, idField = 'ID') {
    try {
      const existingData = await this.readWorksheetData(worksheetName);
      const filteredData = existingData.filter(item => item[idField] != id);
      await this.writeWorksheetData(worksheetName, filteredData);
      console.log(`Deleted row from worksheet: ${worksheetName}`);
    } catch (error) {
      console.error(`Failed to delete row from worksheet ${worksheetName}:`, error);
      throw error;
    }
  }

  // Sync all data from Excel
  async syncFromExcel() {
    try {
      const [projects, resources, projectLinks, timeEntries, managers] = await Promise.all([
        this.readWorksheetData('Projects'),
        this.readWorksheetData('Resources'),
        this.readWorksheetData('ProjectLinks'),
        this.readWorksheetData('TimeEntries'),
        this.readWorksheetData('ProjectManagers')
      ]);

      // Transform data back to application format
      const transformedData = {
        projects: projects.map(p => ({ ...p, id: parseInt(p.ID) || Date.now() })),
        resources: resources.map(r => ({
          ...r,
          id: parseInt(r.ID) || Date.now(),
          managerId: parseInt(r.ManagerID),
          skills: r.Skills ? JSON.parse(r.Skills) : []
        })),
        projectResourceLinks: projectLinks.map(pl => ({
          ...pl,
          id: parseInt(pl.ID) || Date.now(),
          projectId: parseInt(pl.ProjectID),
          resourceId: parseInt(pl.ResourceID),
          managerId: parseInt(pl.ManagerID),
          allocationPercentage: parseFloat(pl.AllocationPercentage)
        })),
        timeEntries: timeEntries.map(te => ({
          ...te,
          id: parseInt(te.ID) || Date.now(),
          resourceId: parseInt(te.ResourceID),
          projectId: parseInt(te.ProjectID),
          managerId: parseInt(te.ManagerID),
          forecastHours: parseFloat(te.ForecastHours),
          actualHours: parseFloat(te.ActualHours),
          date: te.Date
        })),
        projectManagers: managers.map(m => ({ ...m, id: parseInt(m.ID) || Date.now() }))
      };

      return transformedData;
    } catch (error) {
      console.error('Failed to sync from Excel:', error);
      throw error;
    }
  }

  // Sync all data to Excel
  async syncToExcel(data) {
    try {
      // Transform data to Excel format
      const excelData = {
        Projects: data.projects.map(p => ({
          ID: p.id,
          Name: p.name,
          Description: p.description,
          Status: p.status,
          StartDate: p.startDate,
          EndDate: p.endDate,
          CreatedBy: p.createdBy
        })),
        Resources: data.resources.map(r => ({
          ID: r.id,
          Name: r.name,
          Email: r.email,
          Role: r.role,
          Department: r.department,
          ManagerID: r.managerId,
          Skills: JSON.stringify(r.skills || []),
          Avatar: r.avatar
        })),
        ProjectLinks: data.projectResourceLinks.map(pl => ({
          ID: pl.id,
          ProjectID: pl.projectId,
          ResourceID: pl.resourceId,
          ManagerID: pl.managerId,
          AllocationPercentage: pl.allocationPercentage
        })),
        TimeEntries: data.timeEntries.map(te => ({
          ID: te.id,
          ResourceID: te.resourceId,
          ProjectID: te.projectId,
          ManagerID: te.managerId,
          Date: te.date,
          ForecastHours: te.forecastHours,
          ActualHours: te.actualHours,
          Notes: te.notes
        })),
        ProjectManagers: data.projectManagers.map(m => ({
          ID: m.id,
          Name: m.name,
          Email: m.email,
          Department: m.department,
          Avatar: m.avatar
        }))
      };

      // Write each worksheet
      await Promise.all([
        this.writeWorksheetData('Projects', excelData.Projects),
        this.writeWorksheetData('Resources', excelData.Resources),
        this.writeWorksheetData('ProjectLinks', excelData.ProjectLinks),
        this.writeWorksheetData('TimeEntries', excelData.TimeEntries),
        this.writeWorksheetData('ProjectManagers', excelData.ProjectManagers)
      ]);

      console.log('Successfully synced all data to Excel');
    } catch (error) {
      console.error('Failed to sync to Excel:', error);
      throw error;
    }
  }
}

export default new GraphService();
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useExcel } from './ExcelContext';

const CapacityContext = createContext();

const initialState = {
  currentUser: {
    id: 1,
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin', // 'admin' or 'project_manager'
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  projectManagers: [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      department: 'Engineering',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael@company.com',
      department: 'Design',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  ],
  projects: [
    {
      id: 1,
      name: 'E-commerce Platform',
      description: 'Building new e-commerce platform',
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      createdBy: 'admin'
    },
    {
      id: 2,
      name: 'Mobile App Redesign',
      description: 'Redesigning mobile application UI/UX',
      status: 'active',
      startDate: '2024-02-01',
      endDate: '2024-05-15',
      createdBy: 'admin'
    },
    {
      id: 3,
      name: 'API Integration',
      description: 'Third-party API integrations',
      status: 'planning',
      startDate: '2024-03-01',
      endDate: '2024-04-30',
      createdBy: 'admin'
    }
  ],
  resources: [
    {
      id: 1,
      name: 'John Smith',
      email: 'john@company.com',
      role: 'Frontend Developer',
      department: 'Engineering',
      managerId: 1,
      skills: ['React', 'JavaScript', 'TypeScript', 'CSS'],
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Emma Wilson',
      email: 'emma@company.com',
      role: 'Backend Developer',
      department: 'Engineering',
      managerId: 1,
      skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'David Brown',
      email: 'david@company.com',
      role: 'UI/UX Designer',
      department: 'Design',
      managerId: 2,
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'Lisa Garcia',
      email: 'lisa@company.com',
      role: 'Product Designer',
      department: 'Design',
      managerId: 2,
      skills: ['Design Systems', 'Sketch', 'InVision', 'Wireframing'],
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face'
    }
  ],
  projectResourceLinks: [
    {
      id: 1,
      projectId: 1,
      resourceId: 1,
      managerId: 1,
      allocationPercentage: 60
    },
    {
      id: 2,
      projectId: 1,
      resourceId: 2,
      managerId: 1,
      allocationPercentage: 70
    },
    {
      id: 3,
      projectId: 2,
      resourceId: 3,
      managerId: 2,
      allocationPercentage: 80
    },
    {
      id: 4,
      projectId: 2,
      resourceId: 4,
      managerId: 2,
      allocationPercentage: 50
    },
    {
      id: 5,
      projectId: 3,
      resourceId: 1,
      managerId: 1,
      allocationPercentage: 40
    }
  ],
  timeEntries: [
    {
      id: 1,
      resourceId: 1,
      projectId: 1,
      managerId: 1,
      date: '2024-01-15',
      forecastHours: 8,
      actualHours: 7.5,
      notes: 'Frontend development work'
    },
    {
      id: 2,
      resourceId: 1,
      projectId: 1,
      managerId: 1,
      date: '2024-01-16',
      forecastHours: 8,
      actualHours: 8,
      notes: 'Component development'
    },
    {
      id: 3,
      resourceId: 2,
      projectId: 1,
      managerId: 1,
      date: '2024-01-15',
      forecastHours: 6,
      actualHours: 6.5,
      notes: 'API development'
    },
    {
      id: 4,
      resourceId: 3,
      projectId: 2,
      managerId: 2,
      date: '2024-02-01',
      forecastHours: 7,
      actualHours: 6.5,
      notes: 'Design mockups created'
    }
  ]
};

function capacityReducer(state, action) {
  switch (action.type) {
    case 'LOAD_FROM_EXCEL':
      return {
        ...state,
        ...action.payload
      };
    case 'SET_USER_ROLE':
      return {
        ...state,
        currentUser: { ...state.currentUser, ...action.payload }
      };
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, { ...action.payload, id: Date.now() }]
      };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? { ...project, ...action.payload } : project
        )
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload)
      };
    case 'ADD_RESOURCE':
      return {
        ...state,
        resources: [...state.resources, { ...action.payload, id: Date.now() }]
      };
    case 'UPDATE_RESOURCE':
      return {
        ...state,
        resources: state.resources.map(resource =>
          resource.id === action.payload.id ? { ...resource, ...action.payload } : resource
        )
      };
    case 'DELETE_RESOURCE':
      return {
        ...state,
        resources: state.resources.filter(resource => resource.id !== action.payload)
      };
    case 'LINK_PROJECT_RESOURCE':
      return {
        ...state,
        projectResourceLinks: [...state.projectResourceLinks, { ...action.payload, id: Date.now() }]
      };
    case 'UPDATE_PROJECT_RESOURCE_LINK':
      return {
        ...state,
        projectResourceLinks: state.projectResourceLinks.map(link =>
          link.id === action.payload.id ? { ...link, ...action.payload } : link
        )
      };
    case 'UNLINK_PROJECT_RESOURCE':
      return {
        ...state,
        projectResourceLinks: state.projectResourceLinks.filter(link => link.id !== action.payload)
      };
    case 'ADD_TIME_ENTRY':
      return {
        ...state,
        timeEntries: [...state.timeEntries, { ...action.payload, id: Date.now() }]
      };
    case 'UPDATE_TIME_ENTRY':
      return {
        ...state,
        timeEntries: state.timeEntries.map(entry =>
          entry.id === action.payload.id ? { ...entry, ...action.payload } : entry
        )
      };
    case 'DELETE_TIME_ENTRY':
      return {
        ...state,
        timeEntries: state.timeEntries.filter(entry => entry.id !== action.payload)
      };
    default:
      return state;
  }
}

export function CapacityProvider({ children }) {
  const [state, dispatch] = useReducer(capacityReducer, initialState);
  const excel = useExcel();

  // Listen for Excel data updates
  useEffect(() => {
    const handleExcelUpdate = (event) => {
      const data = event.detail;
      dispatch({ type: 'LOAD_FROM_EXCEL', payload: data });
    };

    window.addEventListener('excel-data-updated', handleExcelUpdate);
    return () => window.removeEventListener('excel-data-updated', handleExcelUpdate);
  }, []);

  // Sync to Excel when data changes (debounced)
  useEffect(() => {
    if (excel.isConnected && excel.autoSyncEnabled) {
      const timeoutId = setTimeout(() => {
        excel.syncToExcel(state);
      }, 1000); // 1 second debounce

      return () => clearTimeout(timeoutId);
    }
  }, [state, excel.isConnected, excel.autoSyncEnabled]);

  // User role management
  const setUserRole = (userData) => {
    dispatch({ type: 'SET_USER_ROLE', payload: userData });
  };

  // Project management with Excel sync
  const addProject = async (project) => {
    const newProject = { ...project, id: Date.now() };
    dispatch({ type: 'ADD_PROJECT', payload: newProject });
    
    if (excel.isConnected) {
      try {
        await excel.addToExcel('Projects', {
          ID: newProject.id,
          Name: newProject.name,
          Description: newProject.description,
          Status: newProject.status,
          StartDate: newProject.startDate,
          EndDate: newProject.endDate,
          CreatedBy: newProject.createdBy
        });
      } catch (error) {
        console.error('Failed to sync project to Excel:', error);
      }
    }
  };

  const updateProject = async (project) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: project });
    
    if (excel.isConnected) {
      try {
        await excel.updateInExcel('Projects', {
          ID: project.id,
          Name: project.name,
          Description: project.description,
          Status: project.status,
          StartDate: project.startDate,
          EndDate: project.endDate,
          CreatedBy: project.createdBy
        });
      } catch (error) {
        console.error('Failed to update project in Excel:', error);
      }
    }
  };

  const deleteProject = async (id) => {
    dispatch({ type: 'DELETE_PROJECT', payload: id });
    
    if (excel.isConnected) {
      try {
        await excel.deleteFromExcel('Projects', id);
      } catch (error) {
        console.error('Failed to delete project from Excel:', error);
      }
    }
  };

  // Resource management with Excel sync
  const addResource = async (resource) => {
    const newResource = { ...resource, id: Date.now() };
    dispatch({ type: 'ADD_RESOURCE', payload: newResource });
    
    if (excel.isConnected) {
      try {
        await excel.addToExcel('Resources', {
          ID: newResource.id,
          Name: newResource.name,
          Email: newResource.email,
          Role: newResource.role,
          Department: newResource.department,
          ManagerID: newResource.managerId,
          Skills: JSON.stringify(newResource.skills || []),
          Avatar: newResource.avatar
        });
      } catch (error) {
        console.error('Failed to sync resource to Excel:', error);
      }
    }
  };

  const updateResource = async (resource) => {
    dispatch({ type: 'UPDATE_RESOURCE', payload: resource });
    
    if (excel.isConnected) {
      try {
        await excel.updateInExcel('Resources', {
          ID: resource.id,
          Name: resource.name,
          Email: resource.email,
          Role: resource.role,
          Department: resource.department,
          ManagerID: resource.managerId,
          Skills: JSON.stringify(resource.skills || []),
          Avatar: resource.avatar
        });
      } catch (error) {
        console.error('Failed to update resource in Excel:', error);
      }
    }
  };

  const deleteResource = async (id) => {
    const resource = state.resources.find(r => r.id === id);
    const canDelete = state.currentUser.role === 'admin' || 
      (state.currentUser.role === 'project_manager' && resource?.managerId === state.currentUser.id);

    if (canDelete) {
      dispatch({ type: 'DELETE_RESOURCE', payload: id });
      
      if (excel.isConnected) {
        try {
          await excel.deleteFromExcel('Resources', id);
        } catch (error) {
          console.error('Failed to delete resource from Excel:', error);
        }
      }
    } else {
      alert('You can only delete resources assigned to you.');
    }
  };

  // Project-Resource linking with Excel sync
  const linkProjectResource = async (projectId, resourceId, managerId, allocationPercentage = 100) => {
    const newLink = { projectId, resourceId, managerId, allocationPercentage, id: Date.now() };
    dispatch({ type: 'LINK_PROJECT_RESOURCE', payload: newLink });
    
    if (excel.isConnected) {
      try {
        await excel.addToExcel('ProjectLinks', {
          ID: newLink.id,
          ProjectID: newLink.projectId,
          ResourceID: newLink.resourceId,
          ManagerID: newLink.managerId,
          AllocationPercentage: newLink.allocationPercentage
        });
      } catch (error) {
        console.error('Failed to sync project link to Excel:', error);
      }
    }
  };

  const updateProjectResourceLink = async (linkId, updates) => {
    const updatedLink = { id: linkId, ...updates };
    dispatch({ type: 'UPDATE_PROJECT_RESOURCE_LINK', payload: updatedLink });
    
    if (excel.isConnected) {
      try {
        await excel.updateInExcel('ProjectLinks', {
          ID: updatedLink.id,
          ProjectID: updatedLink.projectId,
          ResourceID: updatedLink.resourceId,
          ManagerID: updatedLink.managerId,
          AllocationPercentage: updatedLink.allocationPercentage
        });
      } catch (error) {
        console.error('Failed to update project link in Excel:', error);
      }
    }
  };

  const unlinkProjectResource = async (linkId) => {
    dispatch({ type: 'UNLINK_PROJECT_RESOURCE', payload: linkId });
    
    if (excel.isConnected) {
      try {
        await excel.deleteFromExcel('ProjectLinks', linkId);
      } catch (error) {
        console.error('Failed to delete project link from Excel:', error);
      }
    }
  };

  // Time entry management with Excel sync
  const addTimeEntry = async (entry) => {
    const newEntry = { ...entry, id: Date.now() };
    dispatch({ type: 'ADD_TIME_ENTRY', payload: newEntry });
    
    if (excel.isConnected) {
      try {
        await excel.addToExcel('TimeEntries', {
          ID: newEntry.id,
          ResourceID: newEntry.resourceId,
          ProjectID: newEntry.projectId,
          ManagerID: newEntry.managerId,
          Date: newEntry.date,
          ForecastHours: newEntry.forecastHours,
          ActualHours: newEntry.actualHours,
          Notes: newEntry.notes
        });
      } catch (error) {
        console.error('Failed to sync time entry to Excel:', error);
      }
    }
  };

  const updateTimeEntry = async (entry) => {
    dispatch({ type: 'UPDATE_TIME_ENTRY', payload: entry });
    
    if (excel.isConnected) {
      try {
        await excel.updateInExcel('TimeEntries', {
          ID: entry.id,
          ResourceID: entry.resourceId,
          ProjectID: entry.projectId,
          ManagerID: entry.managerId,
          Date: entry.date,
          ForecastHours: entry.forecastHours,
          ActualHours: entry.actualHours,
          Notes: entry.notes
        });
      } catch (error) {
        console.error('Failed to update time entry in Excel:', error);
      }
    }
  };

  const deleteTimeEntry = async (id) => {
    dispatch({ type: 'DELETE_TIME_ENTRY', payload: id });
    
    if (excel.isConnected) {
      try {
        await excel.deleteFromExcel('TimeEntries', id);
      } catch (error) {
        console.error('Failed to delete time entry from Excel:', error);
      }
    }
  };

  // Helper functions for filtered data
  const getResourcesByManager = (managerId) => {
    return state.resources.filter(resource => resource.managerId === managerId);
  };

  const getProjectResourceLinks = (managerId = null) => {
    if (managerId) {
      return state.projectResourceLinks.filter(link => link.managerId === managerId);
    }
    return state.projectResourceLinks;
  };

  const getTimeEntries = (filters = {}) => {
    let entries = state.timeEntries;

    if (filters.managerId) {
      entries = entries.filter(entry => entry.managerId === filters.managerId);
    }
    if (filters.projectId) {
      entries = entries.filter(entry => entry.projectId === filters.projectId);
    }
    if (filters.resourceId) {
      entries = entries.filter(entry => entry.resourceId === filters.resourceId);
    }
    if (filters.startDate) {
      entries = entries.filter(entry => entry.date >= filters.startDate);
    }
    if (filters.endDate) {
      entries = entries.filter(entry => entry.date <= filters.endDate);
    }

    return entries;
  };

  const getResourceTotalAllocation = (resourceId) => {
    return state.projectResourceLinks
      .filter(link => link.resourceId === resourceId)
      .reduce((total, link) => total + (link.allocationPercentage || 0), 0);
  };

  const getResourceAvailableAllocation = (resourceId) => {
    const totalAllocated = getResourceTotalAllocation(resourceId);
    return Math.max(0, 100 - totalAllocated);
  };

  const getAllocationCapacityHours = (allocationPercentage, period = 'week') => {
    const fullTimeWeeklyHours = 40;
    const weeklyHours = (allocationPercentage / 100) * fullTimeWeeklyHours;

    if (period === 'week') return weeklyHours;
    if (period === 'day') return weeklyHours / 5;
    if (period === 'month') return weeklyHours * 4.33;
    return weeklyHours;
  };

  const value = {
    ...state,
    setUserRole,
    addProject,
    updateProject,
    deleteProject,
    addResource,
    updateResource,
    deleteResource,
    linkProjectResource,
    updateProjectResourceLink,
    unlinkProjectResource,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    getResourcesByManager,
    getProjectResourceLinks,
    getTimeEntries,
    getResourceTotalAllocation,
    getResourceAvailableAllocation,
    getAllocationCapacityHours
  };

  return (
    <CapacityContext.Provider value={value}>
      {children}
    </CapacityContext.Provider>
  );
}

export function useCapacity() {
  const context = useContext(CapacityContext);
  if (!context) {
    throw new Error('useCapacity must be used within a CapacityProvider');
  }
  return context;
}
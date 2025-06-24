import React, { useState } from 'react';
import { useCapacity } from '../context/CapacityContext';
import SafeIcon from '../common/SafeIcon';
import TimeEntryModal from '../components/TimeEntryModal';
import WeeklyTimeEntryModal from '../components/WeeklyTimeEntryModal';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEdit3, FiTrash2, FiClock, FiCalendar, FiFilter, FiUser, FiFolderPlus } = FiIcons;

function TimeEntry() {
  const { 
    currentUser, 
    getTimeEntries, 
    getResourcesByManager, 
    projects, 
    resources, 
    projectResourceLinks, 
    deleteTimeEntry 
  } = useCapacity();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filters, setFilters] = useState({
    resourceId: '',
    projectId: '',
    startDate: '',
    endDate: ''
  });

  const isAdmin = currentUser.role === 'admin';
  const managerId = isAdmin ? null : currentUser.id;

  // Get filtered data based on user role
  const myResources = isAdmin ? resources : getResourcesByManager(currentUser.id);
  const myProjectLinks = isAdmin ? projectResourceLinks : projectResourceLinks.filter(link => link.managerId === currentUser.id);
  const availableProjects = projects.filter(project => 
    myProjectLinks.some(link => link.projectId === project.id)
  );

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleAddSingle = () => {
    setSelectedEntry(null);
    setIsModalOpen(true);
  };

  const handleAddWeekly = () => {
    setIsWeeklyModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      deleteTimeEntry(id);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get filtered time entries
  const timeEntries = getTimeEntries({
    managerId,
    ...filters,
    resourceId: filters.resourceId || undefined,
    projectId: filters.projectId || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Entry</h1>
          <p className="text-gray-600">
            {isAdmin ? 'Manage all time entries' : 'Manage time entries for your resources'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {!isAdmin && (
            <button
              onClick={handleAddWeekly}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <SafeIcon icon={FiCalendar} className="h-4 w-4" />
              <span>Weekly Entry</span>
            </button>
          )}
          <button
            onClick={handleAddSingle}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <SafeIcon icon={FiFilter} className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
            <select
              value={filters.resourceId}
              onChange={(e) => handleFilterChange('resourceId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Resources</option>
              {myResources.map(resource => (
                <option key={resource.id} value={resource.id}>{resource.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={filters.projectId}
              onChange={(e) => handleFilterChange('projectId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Projects</option>
              {availableProjects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Time Entries List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Time Entries ({timeEntries.length})</h3>
        </div>
        
        {timeEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecast</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeEntries.map((entry) => {
                  const resource = resources.find(r => r.id === entry.resourceId);
                  const project = projects.find(p => p.id === entry.projectId);
                  const variance = entry.actualHours - entry.forecastHours;

                  return (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <SafeIcon icon={FiCalendar} className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={resource?.avatar} 
                            alt={resource?.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{resource?.name}</div>
                            <div className="text-sm text-gray-500">{resource?.role}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <SafeIcon icon={FiFolderPlus} className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{project?.name}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{entry.forecastHours}h</span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{entry.actualHours || 0}h</span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          variance > 0 ? 'text-red-600' : 
                          variance < 0 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {variance > 0 ? '+' : ''}{variance.toFixed(1)}h
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <SafeIcon icon={FiEdit3} className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <SafeIcon icon={FiClock} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No time entries found</h3>
            <p className="text-gray-600 mb-4">Start by adding your first time entry.</p>
            <div className="flex items-center justify-center space-x-3">
              {!isAdmin && (
                <button
                  onClick={handleAddWeekly}
                  className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <SafeIcon icon={FiCalendar} className="h-4 w-4" />
                  <span>Add Weekly Entry</span>
                </button>
              )}
              <button
                onClick={handleAddSingle}
                className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <SafeIcon icon={FiPlus} className="h-4 w-4" />
                <span>Add Time Entry</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <TimeEntryModal
          entry={selectedEntry}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isWeeklyModalOpen && (
        <WeeklyTimeEntryModal
          onClose={() => setIsWeeklyModalOpen(false)}
        />
      )}
    </div>
  );
}

export default TimeEntry;
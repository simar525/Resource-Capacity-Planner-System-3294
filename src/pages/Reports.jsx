import React, { useState } from 'react';
import { useCapacity } from '../context/CapacityContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiBarChart3, FiTrendingUp, FiCalendar, FiFilter, FiDownload } = FiIcons;

function Reports() {
  const { 
    currentUser,
    getTimeEntries,
    getResourcesByManager,
    projects,
    resources,
    projectManagers
  } = useCapacity();

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    projectId: '',
    managerId: currentUser.role === 'admin' ? '' : currentUser.id
  });

  const isAdmin = currentUser.role === 'admin';

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get filtered data
  const timeEntries = getTimeEntries({
    ...filters,
    projectId: filters.projectId || undefined,
    managerId: filters.managerId || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined
  });

  // Calculate metrics
  const totalForecastHours = timeEntries.reduce((sum, entry) => sum + entry.forecastHours, 0);
  const totalActualHours = timeEntries.reduce((sum, entry) => sum + (entry.actualHours || 0), 0);
  const variance = totalActualHours - totalForecastHours;
  const accuracy = totalForecastHours > 0 ? ((totalActualHours / totalForecastHours) * 100) : 0;

  // Resource utilization
  const resourceUtilization = resources.map(resource => {
    const resourceEntries = timeEntries.filter(entry => entry.resourceId === resource.id);
    const actualHours = resourceEntries.reduce((sum, entry) => sum + (entry.actualHours || 0), 0);
    const forecastHours = resourceEntries.reduce((sum, entry) => sum + entry.forecastHours, 0);
    
    return {
      resource,
      actualHours,
      forecastHours,
      variance: actualHours - forecastHours,
      accuracy: forecastHours > 0 ? (actualHours / forecastHours) * 100 : 0
    };
  }).filter(item => item.actualHours > 0 || item.forecastHours > 0);

  // Project breakdown
  const projectBreakdown = projects.map(project => {
    const projectEntries = timeEntries.filter(entry => entry.projectId === project.id);
    const actualHours = projectEntries.reduce((sum, entry) => sum + (entry.actualHours || 0), 0);
    const forecastHours = projectEntries.reduce((sum, entry) => sum + entry.forecastHours, 0);
    
    return {
      project,
      actualHours,
      forecastHours,
      variance: actualHours - forecastHours,
      resourceCount: [...new Set(projectEntries.map(entry => entry.resourceId))].length
    };
  }).filter(item => item.actualHours > 0 || item.forecastHours > 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">
            {isAdmin ? 'Comprehensive reporting dashboard' : 'Your team performance metrics'}
          </p>
        </div>
        <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
          <SafeIcon icon={FiDownload} className="h-4 w-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <SafeIcon icon={FiFilter} className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Report Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={filters.projectId}
              onChange={(e) => handleFilterChange('projectId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
              <select
                value={filters.managerId}
                onChange={(e) => handleFilterChange('managerId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Managers</option>
                {projectManagers.map(manager => (
                  <option key={manager.id} value={manager.id}>{manager.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Forecast</p>
              <p className="text-2xl font-bold text-gray-900">{totalForecastHours.toFixed(1)}h</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
              <SafeIcon icon={FiCalendar} className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Actual</p>
              <p className="text-2xl font-bold text-gray-900">{totalActualHours.toFixed(1)}h</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
              <SafeIcon icon={FiBarChart3} className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Variance</p>
              <p className={`text-2xl font-bold ${variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {variance >= 0 ? '+' : ''}{variance.toFixed(1)}h
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${variance >= 0 ? 'bg-red-500' : 'bg-green-500'} flex items-center justify-center`}>
              <SafeIcon icon={FiTrendingUp} className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">{accuracy.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
              <SafeIcon icon={FiBarChart3} className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Utilization */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Resource Utilization</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {resourceUtilization.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.resource.avatar}
                        alt={item.resource.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.resource.name}</p>
                        <p className="text-xs text-gray-500">{item.resource.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {item.actualHours.toFixed(1)}h / {item.forecastHours.toFixed(1)}h
                      </p>
                      <p className="text-xs text-gray-500">{item.accuracy.toFixed(0)}% accuracy</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.accuracy > 110 ? 'bg-red-500' :
                        item.accuracy > 90 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(item.accuracy, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Project Breakdown</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {projectBreakdown.map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{item.project.name}</h4>
                    <span className="text-xs text-gray-500">{item.resourceCount} resources</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Forecast</p>
                      <p className="font-medium">{item.forecastHours.toFixed(1)}h</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Actual</p>
                      <p className="font-medium">{item.actualHours.toFixed(1)}h</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Variance</p>
                      <p className={`font-medium ${item.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.variance >= 0 ? '+' : ''}{item.variance.toFixed(1)}h
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
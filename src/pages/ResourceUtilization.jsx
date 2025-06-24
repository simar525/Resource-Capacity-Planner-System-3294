import React, { useState, useMemo } from 'react';
import { useCapacity } from '../context/CapacityContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiTrendingUp, FiTrendingDown, FiAlertTriangle, FiCheckCircle, FiClock, FiFilter, FiRefreshCw } = FiIcons;

function ResourceUtilization() {
  const { resources, getTimeEntries, projectManagers, currentUser, getResourceTotalAllocation, getAllocationCapacityHours } = useCapacity();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Calculate utilization metrics
  const utilizationData = useMemo(() => {
    const timeEntries = getTimeEntries({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    });

    // Calculate days in range
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const daysInRange = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const weeksInRange = daysInRange / 7;

    return resources.map(resource => {
      const resourceEntries = timeEntries.filter(entry => entry.resourceId === resource.id);
      const totalActualHours = resourceEntries.reduce((sum, entry) => sum + (entry.actualHours || 0), 0);
      const totalForecastHours = resourceEntries.reduce((sum, entry) => sum + entry.forecastHours, 0);
      
      // Get resource's total allocation percentage and calculate expected capacity
      const totalAllocationPercentage = getResourceTotalAllocation(resource.id);
      const weeklyAllocatedHours = getAllocationCapacityHours(totalAllocationPercentage);
      const expectedCapacity = weeklyAllocatedHours * weeksInRange;
      
      const utilization = expectedCapacity > 0 ? (totalActualHours / expectedCapacity) * 100 : 0;
      
      // Determine status
      let status = 'optimal';
      if (utilization > 100) status = 'overloaded';
      else if (utilization > 90) status = 'high';
      else if (utilization < 50) status = 'available';

      // Get manager info
      const manager = projectManagers.find(pm => pm.id === resource.managerId);

      return {
        ...resource,
        manager: manager?.name || 'Unknown',
        totalActualHours: totalActualHours,
        totalForecastHours: totalForecastHours,
        expectedCapacity: expectedCapacity,
        weeklyAllocatedHours: weeklyAllocatedHours,
        allocationPercentage: totalAllocationPercentage,
        utilization: utilization,
        status: status,
        variance: totalActualHours - totalForecastHours,
        efficiency: totalForecastHours > 0 ? (totalActualHours / totalForecastHours) * 100 : 0,
        availableHours: Math.max(0, expectedCapacity - totalActualHours)
      };
    });
  }, [resources, dateRange, getTimeEntries, projectManagers, getResourceTotalAllocation, getAllocationCapacityHours]);

  // Filter data
  const filteredData = useMemo(() => {
    return utilizationData.filter(resource => {
      if (departmentFilter && resource.department !== departmentFilter) return false;
      if (statusFilter !== 'all' && resource.status !== statusFilter) return false;
      return true;
    });
  }, [utilizationData, departmentFilter, statusFilter]);

  // Summary statistics
  const summary = useMemo(() => {
    const total = filteredData.length;
    const overloaded = filteredData.filter(r => r.status === 'overloaded').length;
    const available = filteredData.filter(r => r.status === 'available').length;
    const optimal = filteredData.filter(r => r.status === 'optimal').length;
    const high = filteredData.filter(r => r.status === 'high').length;
    
    const avgUtilization = total > 0 
      ? filteredData.reduce((sum, r) => sum + r.utilization, 0) / total 
      : 0;

    const totalAvailableHours = filteredData.reduce((sum, r) => sum + r.availableHours, 0);

    return {
      total,
      overloaded,
      available,
      optimal,
      high,
      avgUtilization,
      totalAvailableHours
    };
  }, [filteredData]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'overloaded': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'optimal': return 'bg-green-100 text-green-800 border-green-200';
      case 'available': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'overloaded': return FiAlertTriangle;
      case 'high': return FiTrendingUp;
      case 'optimal': return FiCheckCircle;
      case 'available': return FiTrendingDown;
      default: return FiClock;
    }
  };

  const departments = [...new Set(resources.map(r => r.department))];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resource Utilization Dashboard</h1>
          <p className="text-gray-600">Monitor team capacity, availability, and workload distribution based on project allocations</p>
        </div>
        <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
          <SafeIcon icon={FiRefreshCw} className="h-4 w-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="overloaded">Overloaded (&gt;100%)</option>
              <option value="high">High Utilization (90-100%)</option>
              <option value="optimal">Optimal (50-90%)</option>
              <option value="available">Available (&lt;50%)</option>
            </select>
          </div>
          <div className="flex items-end">
            <span className="text-sm text-gray-500">
              {filteredData.length} of {utilizationData.length} resources
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Resources</p>
              <p className="text-xl font-bold text-gray-900">{summary.total}</p>
            </div>
            <SafeIcon icon={FiUsers} className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Overloaded</p>
              <p className="text-xl font-bold text-red-700">{summary.overloaded}</p>
              <p className="text-xs text-red-500">{summary.total > 0 ? ((summary.overloaded / summary.total) * 100).toFixed(0) : 0}% of team</p>
            </div>
            <SafeIcon icon={FiAlertTriangle} className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Available</p>
              <p className="text-xl font-bold text-blue-700">{summary.available}</p>
              <p className="text-xs text-blue-500">{summary.totalAvailableHours.toFixed(0)}h capacity</p>
            </div>
            <SafeIcon icon={FiTrendingDown} className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Optimal</p>
              <p className="text-xl font-bold text-green-700">{summary.optimal}</p>
              <p className="text-xs text-green-500">50-90% utilized</p>
            </div>
            <SafeIcon icon={FiCheckCircle} className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Utilization</p>
              <p className="text-xl font-bold text-gray-900">{summary.avgUtilization.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">across all resources</p>
            </div>
            <SafeIcon icon={FiTrendingUp} className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Resource List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Resource Details</h3>
          <p className="text-sm text-gray-600">Utilization based on project allocations and actual time logged</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((resource) => (
                <tr key={resource.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <img
                        src={resource.avatar}
                        alt={resource.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                        <div className="text-sm text-gray-500">{resource.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{resource.department}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{resource.manager}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {resource.allocationPercentage}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {resource.weeklyAllocatedHours.toFixed(1)}h/week
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className={`h-2 rounded-full ${
                            resource.utilization > 100 ? 'bg-red-500' :
                            resource.utilization > 90 ? 'bg-yellow-500' :
                            resource.utilization > 50 ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(resource.utilization, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {resource.utilization.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {resource.totalActualHours.toFixed(1)}h / {resource.expectedCapacity.toFixed(1)}h
                    </div>
                    <div className="text-xs text-gray-500">
                      Expected for period
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      resource.availableHours > 0 ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {resource.availableHours.toFixed(1)}h
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(resource.status)}`}>
                      <SafeIcon icon={getStatusIcon(resource.status)} className="h-3 w-3 mr-1" />
                      {resource.status === 'overloaded' && 'Overloaded'}
                      {resource.status === 'high' && 'High Load'}
                      {resource.status === 'optimal' && 'Optimal'}
                      {resource.status === 'available' && 'Available'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      resource.efficiency > 110 ? 'text-red-600' :
                      resource.efficiency > 90 ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {resource.efficiency.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <SafeIcon icon={FiUsers} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </div>

      {/* Action Items */}
      {(summary.overloaded > 0 || summary.available > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recommended Actions</h3>
          <div className="space-y-3">
            {summary.overloaded > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <SafeIcon icon={FiAlertTriangle} className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {summary.overloaded} resource{summary.overloaded > 1 ? 's are' : ' is'} overloaded
                  </p>
                  <p className="text-sm text-red-700">
                    Consider redistributing workload or adjusting project allocations to prevent burnout.
                  </p>
                </div>
              </div>
            )}
            
            {summary.available > 0 && summary.totalAvailableHours > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <SafeIcon icon={FiTrendingDown} className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    {summary.totalAvailableHours.toFixed(0)} hours of available capacity
                  </p>
                  <p className="text-sm text-blue-700">
                    {summary.available} resource{summary.available > 1 ? 's have' : ' has'} bandwidth for additional work or higher project allocation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourceUtilization;
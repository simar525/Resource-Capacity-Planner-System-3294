import React, { useState } from 'react';
import { useCapacity } from '../context/CapacityContext';
import SafeIcon from '../common/SafeIcon';
import ResourceModal from '../components/ResourceModal';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEdit3, FiTrash2, FiUser, FiUsers, FiFilter, FiPercent, FiPieChart } = FiIcons;

function Resources() {
  const { 
    currentUser, 
    resources, 
    deleteResource, 
    getResourcesByManager, 
    projectManagers,
    getResourceTotalAllocation,
    getAllocationCapacityHours
  } = useCapacity();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [managerFilter, setManagerFilter] = useState('');

  const isAdmin = currentUser.role === 'admin';

  // Get resources based on role and filter
  const getDisplayResources = () => {
    if (isAdmin) {
      if (managerFilter) {
        return resources.filter(resource => resource.managerId == managerFilter);
      }
      return resources;
    } else {
      return getResourcesByManager(currentUser.id);
    }
  };

  const displayResources = getDisplayResources();

  const handleEdit = (resource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedResource(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      deleteResource(id);
    }
  };

  const getManagerName = (managerId) => {
    const manager = projectManagers.find(pm => pm.id === managerId);
    return manager ? manager.name : 'Unknown Manager';
  };

  const getUtilizationColor = (percentage) => {
    if (percentage > 100) return 'text-red-600 bg-red-50';
    if (percentage === 100) return 'text-green-600 bg-green-50';
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-50';
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'All Resources' : 'My Resources'}
          </h1>
          <p className="text-gray-600">
            {isAdmin ? 'Manage all company resources and their capacity allocations' : 'Manage your team resources and capacity allocations'}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="h-4 w-4" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Admin Filters */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center space-x-4">
            <SafeIcon icon={FiFilter} className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter by manager:</span>
            <select
              value={managerFilter}
              onChange={(e) => setManagerFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Managers</option>
              {projectManagers.map(manager => (
                <option key={manager.id} value={manager.id}>{manager.name}</option>
              ))}
            </select>
            <span className="text-sm text-gray-500">
              ({displayResources.length} resources)
            </span>
          </div>
        </div>
      )}

      {/* Resources Grid */}
      {displayResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayResources.map((resource) => {
            const totalAllocation = getResourceTotalAllocation(resource.id);
            const allocatedHours = getAllocationCapacityHours(totalAllocation);
            const isOverallocated = totalAllocation > 100;
            
            return (
              <div key={resource.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={resource.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                      alt={resource.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{resource.name}</h3>
                      <p className="text-sm text-gray-600">{resource.role}</p>
                      <p className="text-xs text-gray-500">{resource.department}</p>
                      {isAdmin && (
                        <p className="text-xs text-primary-600 font-medium">
                          Manager: {getManagerName(resource.managerId)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(resource)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit resource"
                    >
                      <SafeIcon icon={FiEdit3} className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete resource"
                    >
                      <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Capacity Allocation */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <SafeIcon icon={FiPieChart} className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Capacity Allocation</span>
                      </div>
                      <span className={`text-sm font-bold px-2 py-1 rounded-full ${getUtilizationColor(totalAllocation)}`}>
                        {totalAllocation}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${
                          isOverallocated ? 'bg-red-500' : 
                          totalAllocation === 100 ? 'bg-green-500' : 
                          totalAllocation >= 80 ? 'bg-yellow-500' : 
                          'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(totalAllocation, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {allocatedHours.toFixed(1)}h/week allocated
                      </span>
                      <span>
                        {(40 - allocatedHours).toFixed(1)}h available
                      </span>
                    </div>
                    
                    {isOverallocated && (
                      <div className="mt-2 text-xs text-red-600 font-medium">
                        ⚠️ Overallocated by {(totalAllocation - 100)}%
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {resource.skills && resource.skills.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <SafeIcon icon={FiUser} className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Skills</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {resource.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {resource.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{resource.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <SafeIcon icon={FiUsers} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isAdmin ? 'No resources found' : 'No team resources yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {isAdmin ? (
              managerFilter ? 
                `No resources found for selected manager.` : 
                'Get started by adding your first resource.'
            ) : (
              'Start building your team by adding resources.'
            )}
          </p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4" />
            <span>Add Resource</span>
          </button>
        </div>
      )}

      {isModalOpen && (
        <ResourceModal
          resource={selectedResource}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

export default Resources;
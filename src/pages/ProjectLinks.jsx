import React, { useState } from 'react';
import { useCapacity } from '../context/CapacityContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiLink, FiPlus, FiTrash2, FiUsers, FiFolderPlus, FiEdit3, FiPercent, FiAlertTriangle, FiCheckCircle } = FiIcons;

function ProjectLinks() {
  const { 
    currentUser, 
    projects, 
    getResourcesByManager, 
    getProjectResourceLinks, 
    linkProjectResource, 
    unlinkProjectResource,
    updateProjectResourceLink,
    getResourceTotalAllocation,
    getResourceAvailableAllocation,
    getAllocationCapacityHours
  } = useCapacity();
  
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedResource, setSelectedResource] = useState('');
  const [allocationPercentage, setAllocationPercentage] = useState(50);
  const [editingLink, setEditingLink] = useState(null);

  const myResources = getResourcesByManager(currentUser.id);
  const myLinks = getProjectResourceLinks(currentUser.id);

  const handleLinkResource = () => {
    if (selectedProject && selectedResource && allocationPercentage > 0) {
      const availableAllocation = getResourceAvailableAllocation(parseInt(selectedResource));
      
      if (allocationPercentage > availableAllocation) {
        alert(`Cannot allocate ${allocationPercentage}%. Resource only has ${availableAllocation}% available capacity.`);
        return;
      }

      linkProjectResource(
        parseInt(selectedProject), 
        parseInt(selectedResource), 
        currentUser.id, 
        allocationPercentage
      );
      
      setSelectedProject('');
      setSelectedResource('');
      setAllocationPercentage(50);
    }
  };

  const handleUnlink = (linkId) => {
    if (window.confirm('Are you sure you want to unlink this resource from the project?')) {
      unlinkProjectResource(linkId);
    }
  };

  const handleEditAllocation = (link) => {
    setEditingLink({ ...link });
  };

  const handleSaveEdit = () => {
    if (editingLink) {
      const currentAllocation = myLinks.find(l => l.id === editingLink.id)?.allocationPercentage || 0;
      const otherAllocations = getResourceTotalAllocation(editingLink.resourceId) - currentAllocation;
      const totalAfterEdit = otherAllocations + editingLink.allocationPercentage;
      
      if (totalAfterEdit > 100) {
        alert(`Cannot allocate ${editingLink.allocationPercentage}%. Total allocation would exceed 100% (currently at ${otherAllocations}% for other projects).`);
        return;
      }

      updateProjectResourceLink(editingLink.id, { 
        allocationPercentage: editingLink.allocationPercentage 
      });
      setEditingLink(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingLink(null);
  };

  // Get available projects (not linked to selected resource)
  const getAvailableProjects = () => {
    if (!selectedResource) return projects;
    const linkedProjectIds = myLinks
      .filter(link => link.resourceId == selectedResource)
      .map(link => link.projectId);
    return projects.filter(project => !linkedProjectIds.includes(project.id));
  };

  const availableProjects = getAvailableProjects();

  // Get available allocation for selected resource
  const getMaxAllocation = () => {
    if (!selectedResource) return 100;
    return getResourceAvailableAllocation(parseInt(selectedResource));
  };

  // Get linked projects with resource details
  const linkedProjects = myLinks.reduce((acc, link) => {
    const project = projects.find(p => p.id === link.projectId);
    const resource = myResources.find(r => r.id === link.resourceId);
    
    if (project && resource) {
      if (!acc[project.id]) {
        acc[project.id] = { project, resources: [] };
      }
      acc[project.id].resources.push({ 
        resource, 
        linkId: link.id, 
        allocationPercentage: link.allocationPercentage 
      });
    }
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Links & Capacity Allocation</h1>
          <p className="text-gray-600">Link your resources to projects and set capacity allocation percentages</p>
        </div>
      </div>

      {/* Resource Capacity Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <SafeIcon icon={FiUsers} className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-medium text-gray-900">Resource Capacity Overview</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myResources.map(resource => {
            const totalAllocation = getResourceTotalAllocation(resource.id);
            const availableAllocation = getResourceAvailableAllocation(resource.id);
            const isOverallocated = totalAllocation > 100;
            
            return (
              <div key={resource.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <img src={resource.avatar} alt={resource.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{resource.name}</p>
                    <p className="text-xs text-gray-500">{resource.role}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Allocated</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${isOverallocated ? 'text-red-600' : 'text-gray-900'}`}>
                        {totalAllocation}%
                      </span>
                      {isOverallocated ? (
                        <SafeIcon icon={FiAlertTriangle} className="h-4 w-4 text-red-500" />
                      ) : totalAllocation === 100 ? (
                        <SafeIcon icon={FiCheckCircle} className="h-4 w-4 text-green-500" />
                      ) : null}
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        isOverallocated ? 'bg-red-500' : 
                        totalAllocation === 100 ? 'bg-green-500' : 
                        'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(totalAllocation, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">
                      Available: {availableAllocation}%
                    </span>
                    <span className="text-gray-500">
                      {getAllocationCapacityHours(totalAllocation).toFixed(1)}h/week
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Link New Resource */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <SafeIcon icon={FiLink} className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-medium text-gray-900">Link Resource to Project</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
            <select
              value={selectedResource}
              onChange={(e) => {
                setSelectedResource(e.target.value);
                setAllocationPercentage(Math.min(50, getResourceAvailableAllocation(parseInt(e.target.value))));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select Resource</option>
              {myResources.map(resource => {
                const available = getResourceAvailableAllocation(resource.id);
                return (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} ({available}% available)
                  </option>
                );
              })}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={!selectedResource}
            >
              <option value="">Select Project</option>
              {availableProjects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allocation % (Max: {getMaxAllocation()}%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={getMaxAllocation()}
                value={allocationPercentage}
                onChange={(e) => setAllocationPercentage(Math.min(parseInt(e.target.value) || 0, getMaxAllocation()))}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={!selectedResource}
              />
              <SafeIcon icon={FiPercent} className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {selectedResource && (
              <p className="text-xs text-gray-500 mt-1">
                {getAllocationCapacityHours(allocationPercentage).toFixed(1)}h/week
              </p>
            )}
          </div>
          
          <div>
            <button
              onClick={handleLinkResource}
              disabled={!selectedProject || !selectedResource || allocationPercentage <= 0}
              className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SafeIcon icon={FiPlus} className="h-4 w-4" />
              <span>Link Resource</span>
            </button>
          </div>
        </div>
      </div>

      {/* Current Links */}
      <div className="space-y-4">
        {Object.values(linkedProjects).length > 0 ? (
          Object.values(linkedProjects).map(({ project, resources }) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiFolderPlus} className="h-5 w-5 text-primary-600" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <SafeIcon icon={FiUsers} className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Linked Resources ({resources.length})
                  </span>
                </div>
                
                <div className="space-y-3">
                  {resources.map(({ resource, linkId, allocationPercentage }) => (
                    <div key={linkId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img src={resource.avatar} alt={resource.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{resource.name}</p>
                          <p className="text-xs text-gray-500">{resource.role}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {editingLink?.id === linkId ? (
                          <div className="flex items-center space-x-2">
                            <div className="relative">
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={editingLink.allocationPercentage}
                                onChange={(e) => setEditingLink(prev => ({
                                  ...prev,
                                  allocationPercentage: parseInt(e.target.value) || 0
                                }))}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                              <SafeIcon icon={FiPercent} className="absolute right-1 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                            </div>
                            <button
                              onClick={handleSaveEdit}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {allocationPercentage}%
                              </div>
                              <div className="text-xs text-gray-500">
                                {getAllocationCapacityHours(allocationPercentage).toFixed(1)}h/week
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleEditAllocation({ id: linkId, resourceId: resource.id, allocationPercentage })}
                                className="p-2 text-primary-600 hover:text-primary-800 transition-colors"
                              >
                                <SafeIcon icon={FiEdit3} className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUnlink(linkId)}
                                className="p-2 text-red-400 hover:text-red-600 transition-colors"
                              >
                                <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <SafeIcon icon={FiLink} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No project links yet</h3>
            <p className="text-gray-600">Start by linking your resources to projects above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectLinks;
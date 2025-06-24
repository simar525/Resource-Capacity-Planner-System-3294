import React, { useState, useEffect } from 'react';
import { useCapacity } from '../context/CapacityContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX } = FiIcons;

function TimeEntryModal({ entry, onClose }) {
  const { 
    currentUser,
    addTimeEntry, 
    updateTimeEntry, 
    getResourcesByManager, 
    projects, 
    resources,
    projectResourceLinks
  } = useCapacity();

  const [formData, setFormData] = useState({
    resourceId: '',
    projectId: '',
    date: new Date().toISOString().split('T')[0],
    forecastHours: 0,
    actualHours: 0,
    notes: '',
    managerId: currentUser.role === 'admin' ? 1 : currentUser.id
  });

  const isAdmin = currentUser.role === 'admin';
  const myResources = isAdmin ? resources : getResourcesByManager(currentUser.id);
  const myProjectLinks = isAdmin ? projectResourceLinks : projectResourceLinks.filter(link => link.managerId === currentUser.id);

  useEffect(() => {
    if (entry) {
      setFormData(entry);
    }
  }, [entry]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (entry) {
      updateTimeEntry(formData);
    } else {
      addTimeEntry(formData);
    }
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Hours') ? parseFloat(value) || 0 : value
    }));
  };

  // Get available projects for selected resource
  const getAvailableProjects = () => {
    if (!formData.resourceId) return [];
    
    const resourceProjectLinks = myProjectLinks.filter(link => link.resourceId == formData.resourceId);
    return projects.filter(project => 
      resourceProjectLinks.some(link => link.projectId === project.id)
    );
  };

  const availableProjects = getAvailableProjects();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {entry ? 'Edit Time Entry' : 'Add Time Entry'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <SafeIcon icon={FiX} className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource
            </label>
            <select
              name="resourceId"
              value={formData.resourceId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select Resource</option>
              {myResources.map(resource => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} - {resource.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              disabled={!formData.resourceId}
            >
              <option value="">Select Project</option>
              {availableProjects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {!formData.resourceId && (
              <p className="text-xs text-gray-500 mt-1">Select a resource first to see available projects</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Forecast Hours
              </label>
              <input
                type="number"
                name="forecastHours"
                value={formData.forecastHours}
                onChange={handleChange}
                min="0"
                max="24"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actual Hours
              </label>
              <input
                type="number"
                name="actualHours"
                value={formData.actualHours}
                onChange={handleChange}
                min="0"
                max="24"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Add any notes about the work done..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {entry ? 'Update' : 'Add'} Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TimeEntryModal;
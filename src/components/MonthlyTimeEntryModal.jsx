import React, { useState, useEffect } from 'react';
import { useCapacity } from '../context/CapacityContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiChevronLeft, FiChevronRight, FiSave, FiCalendar } = FiIcons;

function MonthlyTimeEntryModal({ onClose }) {
  const { currentUser, getResourcesByManager, projects, projectResourceLinks, addTimeEntry, resources } = useCapacity();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedResource, setSelectedResource] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [monthlyEntries, setMonthlyEntries] = useState({});
  const [notes, setNotes] = useState('');

  const myResources = getResourcesByManager(currentUser.id);
  const myProjectLinks = projectResourceLinks.filter(link => link.managerId === currentUser.id);

  // Auto-fill forecast hours when resource and project change
  useEffect(() => {
    if (selectedResource && selectedProject) {
      const calendar = generateCalendar();
      const newMonthlyEntries = {};
      
      // Find the allocation for this resource-project combination
      const allocation = myProjectLinks.find(link => 
        link.resourceId == selectedResource && link.projectId == selectedProject
      );
      
      if (allocation) {
        // Calculate daily capacity from allocation percentage
        // 100% = 40 hours/week, so daily = (allocation% / 100) * 40 / 5
        const dailyCapacity = (allocation.allocationPercentage / 100) * 40 / 5;
        
        calendar.flat().forEach(dayData => {
          if (dayData && !dayData.isWeekend) {
            newMonthlyEntries[dayData.date] = {
              forecastHours: parseFloat(dailyCapacity.toFixed(1)),
              actualHours: 0
            };
          }
        });
        
        setMonthlyEntries(newMonthlyEntries);
      }
    } else {
      setMonthlyEntries({});
    }
  }, [selectedResource, selectedProject, selectedMonth]);

  // Get available projects for selected resource
  const getAvailableProjects = () => {
    if (!selectedResource) return [];
    const resourceProjectLinks = myProjectLinks.filter(link => link.resourceId == selectedResource);
    return projects.filter(project => 
      resourceProjectLinks.some(link => link.projectId === project.id)
    );
  };

  const availableProjects = getAvailableProjects();

  // Generate calendar for selected month
  const generateCalendar = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const calendar = [];
    let currentWeek = [];

    // Add empty cells for days before the first day of the month
    const startingDay = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    for (let i = 0; i < startingDay; i++) {
      currentWeek.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toISOString().split('T')[0];
      currentWeek.push({
        day,
        date: dateKey,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });

      // If week is complete (7 days) or it's the last day, add to calendar
      if (currentWeek.length === 7 || day === daysInMonth) {
        // Fill remaining days if it's the last week
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        calendar.push([...currentWeek]);
        currentWeek = [];
      }
    }

    return calendar;
  };

  const calendar = generateCalendar();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction) => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const updateHours = (dateKey, hours) => {
    setMonthlyEntries(prev => ({
      ...prev,
      [dateKey]: {
        forecastHours: parseFloat(hours) || 0,
        actualHours: parseFloat(hours) || 0
      }
    }));
  };

  const getTotalHours = () => {
    return Object.values(monthlyEntries).reduce((sum, entry) => sum + (entry.actualHours || 0), 0);
  };

  const handleSubmit = () => {
    if (!selectedResource || !selectedProject) {
      alert('Please select both resource and project');
      return;
    }

    const entries = Object.entries(monthlyEntries)
      .filter(([_, entry]) => entry.actualHours > 0)
      .map(([date, entry]) => ({
        resourceId: parseInt(selectedResource),
        projectId: parseInt(selectedProject),
        managerId: currentUser.id,
        date,
        forecastHours: entry.forecastHours,
        actualHours: entry.actualHours,
        notes: notes || `Monthly entry for ${monthNames[selectedMonth.getMonth()]} ${selectedMonth.getFullYear()}`
      }));

    if (entries.length === 0) {
      alert('Please add hours for at least one day');
      return;
    }

    // Add all entries
    entries.forEach(entry => addTimeEntry(entry));
    
    alert(`Successfully added ${entries.length} time entries for ${monthNames[selectedMonth.getMonth()]} ${selectedMonth.getFullYear()}`);
    onClose();
  };

  const getSelectedResourceAllocation = () => {
    if (!selectedResource || !selectedProject) return null;
    return myProjectLinks.find(link => 
      link.resourceId == selectedResource && link.projectId == selectedProject
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Monthly Time Entry</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <SafeIcon icon={FiX} className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource *</label>
              <select
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={!selectedResource}
              >
                <option value="">Select Project</option>
                {availableProjects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {!selectedResource && (
                <p className="text-xs text-gray-500 mt-1">Select a resource first</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Optional notes for all entries"
              />
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <SafeIcon icon={FiChevronLeft} className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiCalendar} className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
              </h3>
            </div>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <SafeIcon icon={FiChevronRight} className="h-5 w-5" />
            </button>
          </div>

          {/* Auto-fill Info */}
          {selectedResource && selectedProject && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiCalendar} className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800 font-medium">Auto-filled Forecast Hours</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Forecast hours are automatically calculated based on project allocation: 
                <strong> {getSelectedResourceAllocation()?.allocationPercentage}% of 40h/week = {((getSelectedResourceAllocation()?.allocationPercentage || 0) * 0.4).toFixed(1)}h/day</strong> for working days.
              </p>
            </div>
          )}

          {/* Calendar Grid */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Weeks */}
            {calendar.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-200 last:border-b-0">
                {week.map((dayData, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`border-r border-gray-200 last:border-r-0 h-20 ${
                      dayData ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    {dayData && (
                      <div className="p-2 h-full flex flex-col">
                        <div className={`text-sm font-medium mb-1 ${
                          dayData.isWeekend ? 'text-gray-400' : 'text-gray-700'
                        }`}>
                          {dayData.day}
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={monthlyEntries[dayData.date]?.actualHours || ''}
                          onChange={(e) => updateHours(dayData.date, e.target.value)}
                          className={`flex-1 text-xs px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent ${
                            dayData.isWeekend ? 'bg-gray-50' : 'bg-white'
                          }`}
                          placeholder="0"
                          disabled={!selectedResource || !selectedProject}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-primary-700">
                Total Hours for {monthNames[selectedMonth.getMonth()]}: 
                <span className="font-semibold ml-1">{getTotalHours().toFixed(1)}h</span>
              </div>
              <div className="text-xs text-primary-600">
                {Object.keys(monthlyEntries).filter(key => monthlyEntries[key].actualHours > 0).length} days with entries
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedResource || !selectedProject || getTotalHours() === 0}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiSave} className="h-4 w-4" />
              <span>Save Monthly Entries</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonthlyTimeEntryModal;
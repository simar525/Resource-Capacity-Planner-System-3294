import React, { useState, useEffect } from 'react';
import { useCapacity } from '../context/CapacityContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiChevronLeft, FiChevronRight, FiSave, FiCalendar } = FiIcons;

function WeeklyTimeEntryModal({ onClose }) {
  const { currentUser, getResourcesByManager, projects, projectResourceLinks, addTimeEntry, resources } = useCapacity();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedResource, setSelectedResource] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [weeklyEntries, setWeeklyEntries] = useState({});
  const [notes, setNotes] = useState('');

  const myResources = getResourcesByManager(currentUser.id);
  const myProjectLinks = projectResourceLinks.filter(link => link.managerId === currentUser.id);

  // Auto-fill forecast hours when resource and project change
  useEffect(() => {
    if (selectedResource && selectedProject) {
      const weeks = generateWeeks();
      const newWeeklyEntries = {};
      
      // Find the allocation for this resource-project combination
      const allocation = myProjectLinks.find(link => 
        link.resourceId == selectedResource && link.projectId == selectedProject
      );
      
      if (allocation) {
        // Calculate daily capacity from allocation percentage
        // 100% = 40 hours/week, so daily = (allocation% / 100) * 40 / 5
        const weeklyAllocatedHours = (allocation.allocationPercentage / 100) * 40;
        const dailyCapacity = weeklyAllocatedHours / 5;
        
        weeks.forEach(week => {
          const workingDaysInWeek = week.days.filter(day => !day.isWeekend && day.isCurrentMonth).length;
          const forecastHours = workingDaysInWeek * dailyCapacity;
          
          newWeeklyEntries[week.key] = {
            forecastHours: parseFloat(forecastHours.toFixed(1)),
            actualHours: 0
          };
        });
        
        setWeeklyEntries(newWeeklyEntries);
      }
    } else {
      setWeeklyEntries({});
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

  // Generate weeks for selected month
  const generateWeeks = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();

    // Get first day of month
    const firstDayOfMonth = new Date(year, month, 1);
    
    // Find the Monday of the week containing the first day of the month
    const firstMonday = new Date(firstDayOfMonth);
    const dayOfWeek = firstDayOfMonth.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Monday=0
    firstMonday.setDate(firstDayOfMonth.getDate() - daysToSubtract);

    // Get last day of month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const weeks = [];
    let currentWeekStart = new Date(firstMonday);

    // Generate weeks until we cover the entire month
    while (currentWeekStart <= lastDayOfMonth) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6);

      // Check if this week contains any days from the current month
      const weekContainsMonthDays = 
        (currentWeekStart.getMonth() === month && currentWeekStart.getFullYear() === year) ||
        (weekEnd.getMonth() === month && weekEnd.getFullYear() === year) ||
        (currentWeekStart <= firstDayOfMonth && weekEnd >= lastDayOfMonth);

      if (weekContainsMonthDays) {
        const weekKey = `${currentWeekStart.getFullYear()}-W${getWeekNumber(currentWeekStart)}`;
        weeks.push({
          key: weekKey,
          start: new Date(currentWeekStart),
          end: new Date(weekEnd),
          days: generateDaysForWeek(currentWeekStart),
          isCurrentMonth: true
        });
      }

      // Move to next week
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);

      // Safety check to prevent infinite loops
      if (weeks.length > 6) break;
    }

    return weeks;
  };

  const generateDaysForWeek = (weekStart) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        isWeekend: i === 5 || i === 6, // Saturday or Sunday
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === selectedMonth.getMonth()
      });
    }
    return days;
  };

  const getWeekNumber = (date) => {
    const d = new Date(date);
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + yearStart.getDay() + 1) / 7);
    return weekNo;
  };

  const weeks = generateWeeks();
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

  const updateWeeklyHours = (weekKey, field, hours) => {
    setWeeklyEntries(prev => ({
      ...prev,
      [weekKey]: {
        ...prev[weekKey],
        [field]: parseFloat(hours) || 0
      }
    }));
  };

  const getTotalForecastHours = () => {
    return Object.values(weeklyEntries).reduce((sum, entry) => sum + (entry.forecastHours || 0), 0);
  };

  const getTotalActualHours = () => {
    return Object.values(weeklyEntries).reduce((sum, entry) => sum + (entry.actualHours || 0), 0);
  };

  const formatWeekRange = (start, end) => {
    const startMonth = start.getMonth();
    const endMonth = end.getMonth();
    
    if (startMonth === endMonth) {
      return `${start.getDate()}-${end.getDate()} ${monthNames[startMonth].slice(0, 3)}`;
    } else {
      return `${start.getDate()} ${monthNames[startMonth].slice(0, 3)} - ${end.getDate()} ${monthNames[endMonth].slice(0, 3)}`;
    }
  };

  const handleSubmit = () => {
    if (!selectedResource || !selectedProject) {
      alert('Please select both resource and project');
      return;
    }

    const entries = [];

    // Convert weekly entries to daily entries
    Object.entries(weeklyEntries).forEach(([weekKey, weekData]) => {
      if ((weekData.forecastHours || 0) > 0 || (weekData.actualHours || 0) > 0) {
        const week = weeks.find(w => w.key === weekKey);
        if (week) {
          // Distribute hours across weekdays (Mon-Fri)
          const weekdays = week.days.filter(day => !day.isWeekend && day.isCurrentMonth);
          const forecastPerDay = weekdays.length > 0 ? (weekData.forecastHours || 0) / weekdays.length : 0;
          const actualPerDay = weekdays.length > 0 ? (weekData.actualHours || 0) / weekdays.length : 0;

          weekdays.forEach(day => {
            if (forecastPerDay > 0 || actualPerDay > 0) {
              entries.push({
                resourceId: parseInt(selectedResource),
                projectId: parseInt(selectedProject),
                managerId: currentUser.id,
                date: day.date,
                forecastHours: parseFloat(forecastPerDay.toFixed(2)),
                actualHours: parseFloat(actualPerDay.toFixed(2)),
                notes: notes || `Weekly entry for ${formatWeekRange(week.start, week.end)} - ${monthNames[selectedMonth.getMonth()]} ${selectedMonth.getFullYear()}`
              });
            }
          });
        }
      }
    });

    if (entries.length === 0) {
      alert('Please add hours for at least one week');
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Weekly Time Entry</h2>
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
                <strong> {getSelectedResourceAllocation()?.allocationPercentage}% of 40h/week = {((getSelectedResourceAllocation()?.allocationPercentage || 0) * 0.4).toFixed(1)}h/day</strong>. 
                You can adjust them as needed.
              </p>
            </div>
          )}

          {/* Weekly Entry Grid */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Headers */}
            <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200">
              <div className="p-4 font-medium text-gray-700">Week</div>
              <div className="p-4 font-medium text-gray-700">Working Days</div>
              <div className="p-4 font-medium text-gray-700">Forecast Hours</div>
              <div className="p-4 font-medium text-gray-700">Actual Hours</div>
            </div>

            {/* Week Rows */}
            {weeks.map((week, index) => {
              const workingDays = week.days.filter(d => !d.isWeekend && d.isCurrentMonth);
              return (
                <div key={week.key} className="grid grid-cols-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-25">
                  {/* Week Range */}
                  <div className="p-4 flex flex-col justify-center">
                    <div className="text-sm font-medium text-gray-900">
                      Week {index + 1}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatWeekRange(week.start, week.end)}
                    </div>
                  </div>

                  {/* Working Days Preview */}
                  <div className="p-4 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-1">
                      {workingDays.map((day, dayIndex) => (
                        <div key={dayIndex} className="text-xs px-2 py-1 rounded bg-green-50 text-green-700">
                          {day.dayName} {day.dayNumber}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {workingDays.length} working days
                      {selectedResource && selectedProject && (
                        <span className="block text-blue-600">
                          = {workingDays.length} × {((getSelectedResourceAllocation()?.allocationPercentage || 0) * 0.4).toFixed(1)}h
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Forecast Hours Input */}
                  <div className="p-4 flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="60"
                      step="0.5"
                      value={weeklyEntries[week.key]?.forecastHours || ''}
                      onChange={(e) => updateWeeklyHours(week.key, 'forecastHours', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0"
                      disabled={!selectedResource || !selectedProject}
                    />
                  </div>

                  {/* Actual Hours Input */}
                  <div className="p-4 flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="60"
                      step="0.5"
                      value={weeklyEntries[week.key]?.actualHours || ''}
                      onChange={(e) => updateWeeklyHours(week.key, 'actualHours', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0"
                      disabled={!selectedResource || !selectedProject}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-primary-700">
                Total Forecast: <span className="font-semibold ml-1">{getTotalForecastHours().toFixed(1)}h</span>
              </div>
              <div className="text-primary-700">
                Total Actual: <span className="font-semibold ml-1">{getTotalActualHours().toFixed(1)}h</span>
              </div>
              <div className="text-primary-600">
                Variance: <span className={`font-semibold ml-1 ${getTotalActualHours() - getTotalForecastHours() > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {getTotalActualHours() - getTotalForecastHours() > 0 ? '+' : ''}
                  {(getTotalActualHours() - getTotalForecastHours()).toFixed(1)}h
                </span>
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
              disabled={!selectedResource || !selectedProject || (getTotalForecastHours() === 0 && getTotalActualHours() === 0)}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiSave} className="h-4 w-4" />
              <span>Save Weekly Entries</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeeklyTimeEntryModal;
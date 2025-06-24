import React, { useState } from 'react';
import { useCapacity } from '../context/CapacityContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiChevronLeft, FiChevronRight, FiCalendar, FiClock } = FiIcons;

function Calendar() {
  const { resources, projects } = useCapacity();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert to Monday = 0

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getResourceWorkload = (resourceId, date) => {
    if (!date) return 0;
    
    return projects.reduce((total, project) => {
      const projectStart = new Date(project.startDate);
      const projectEnd = new Date(project.endDate);
      
      if (date >= projectStart && date <= projectEnd) {
        const allocation = project.allocations.find(a => a.resourceId === resourceId);
        return total + (allocation ? allocation.hoursPerWeek / 5 : 0); // Divide by 5 for daily hours
      }
      return total;
    }, 0);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Capacity Calendar</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <SafeIcon icon={FiChevronLeft} className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <SafeIcon icon={FiChevronRight} className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-4 bg-gray-50 border-r border-gray-200">
            <span className="text-sm font-medium text-gray-600">Resource</span>
          </div>
          {daysOfWeek.map(day => (
            <div key={day} className="p-4 bg-gray-50 text-center border-r border-gray-200 last:border-r-0">
              <span className="text-sm font-medium text-gray-600">{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="max-h-[600px] overflow-y-auto">
          {resources.map(resource => (
            <div key={resource.id} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0">
              {/* Resource Info */}
              <div className="p-4 border-r border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <img
                    src={resource.avatar}
                    alt={resource.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{resource.name}</p>
                    <p className="text-xs text-gray-500">{resource.role}</p>
                  </div>
                </div>
              </div>

              {/* Calendar Days for this Resource */}
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const dayOfMonth = days.find((day, index) => {
                  if (!day) return false;
                  return (index % 7) === dayIndex;
                });

                const workload = dayOfMonth ? getResourceWorkload(resource.id, dayOfMonth) : 0;
                const utilizationPercent = resource.capacity > 0 ? (workload / (resource.capacity / 5)) * 100 : 0;

                return (
                  <div 
                    key={dayIndex} 
                    className="p-2 border-r border-gray-200 last:border-r-0 min-h-[80px] relative"
                  >
                    {dayOfMonth && (
                      <>
                        <div className={`text-xs font-medium mb-2 ${isToday(dayOfMonth) ? 'text-primary-600' : 'text-gray-600'}`}>
                          {dayOfMonth.getDate()}
                        </div>
                        
                        {workload > 0 && (
                          <div className="space-y-1">
                            <div className={`text-xs px-2 py-1 rounded text-center ${
                              utilizationPercent > 100 ? 'bg-red-100 text-red-800' :
                              utilizationPercent > 90 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {workload.toFixed(1)}h
                            </div>
                            
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className={`h-1 rounded-full ${
                                  utilizationPercent > 100 ? 'bg-red-500' :
                                  utilizationPercent > 90 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {isToday(dayOfMonth) && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Under 90% utilization</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-600">90-100% utilization</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Over 100% utilization</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
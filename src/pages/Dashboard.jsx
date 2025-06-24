import React from 'react';
import { useCapacity } from '../context/CapacityContext';
import { useExcel } from '../context/ExcelContext';
import SafeIcon from '../common/SafeIcon';
import ExcelConnectionPanel from '../components/ExcelConnectionPanel';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiFolderPlus, FiClock, FiTrendingUp, FiCalendar, FiPlus, FiUserCheck } = FiIcons;

function Dashboard() {
  const { currentUser, projects, resources, projectManagers, timeEntries, getResourcesByManager, getTimeEntries } = useCapacity();
  const { isConnected, lastSync } = useExcel();
  const isAdmin = currentUser.role === 'admin';

  // Stats calculation
  const getStats = () => {
    if (isAdmin) {
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const totalResources = resources.length;
      const totalManagers = projectManagers.length;
      const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.actualHours || 0), 0);

      return [
        { name: 'Active Projects', value: activeProjects, icon: FiFolderPlus, color: 'bg-blue-500' },
        { name: 'Project Managers', value: totalManagers, icon: FiUserCheck, color: 'bg-green-500' },
        { name: 'Total Resources', value: totalResources, icon: FiUsers, color: 'bg-purple-500' },
        { name: 'Hours Logged', value: `${totalHours.toFixed(1)}h`, icon: FiClock, color: 'bg-orange-500' }
      ];
    } else {
      const myResources = getResourcesByManager(currentUser.id);
      const myTimeEntries = getTimeEntries({ managerId: currentUser.id });
      const myProjects = [...new Set(myTimeEntries.map(entry => entry.projectId))].length;
      const myHours = myTimeEntries.reduce((sum, entry) => sum + (entry.actualHours || 0), 0);

      const thisWeekEntries = myTimeEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      });
      const thisWeekHours = thisWeekEntries.reduce((sum, entry) => sum + (entry.actualHours || 0), 0);

      return [
        { name: 'My Resources', value: myResources.length, icon: FiUsers, color: 'bg-blue-500' },
        { name: 'Active Projects', value: myProjects, icon: FiFolderPlus, color: 'bg-green-500' },
        { name: 'Total Hours', value: `${myHours.toFixed(1)}h`, icon: FiClock, color: 'bg-purple-500' },
        { name: 'This Week', value: `${thisWeekHours.toFixed(1)}h`, icon: FiTrendingUp, color: 'bg-orange-500' }
      ];
    }
  };

  const stats = getStats();

  // Recent activity
  const getRecentActivity = () => {
    const recentEntries = isAdmin
      ? timeEntries.slice(-5).reverse()
      : getTimeEntries({ managerId: currentUser.id }).slice(-5).reverse();

    return recentEntries.map(entry => {
      const resource = resources.find(r => r.id === entry.resourceId);
      const project = projects.find(p => p.id === entry.projectId);
      return {
        action: `${resource?.name} logged ${entry.actualHours}h on ${project?.name}`,
        time: new Date(entry.date).toLocaleDateString(),
        type: 'time_entry'
      };
    });
  };

  const recentActivity = getRecentActivity();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            {isAdmin 
              ? 'Admin Overview - Manage all projects and resources' 
              : `Project Manager Dashboard - Welcome, ${currentUser.name}`
            }
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
          {isConnected && lastSync && (
            <div className="text-xs text-green-600">
              Excel sync: {lastSync.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Excel Integration Panel */}
      <ExcelConnectionPanel />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                <SafeIcon icon={stat.icon} className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No recent activity</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {isAdmin ? (
              <>
                <button className="w-full p-3 text-left bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiFolderPlus} className="h-5 w-5 text-primary-600" />
                    <span className="text-sm font-medium text-primary-700">Create New Project</span>
                  </div>
                </button>
                <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiUsers} className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Add Resource</span>
                  </div>
                </button>
                <button className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiTrendingUp} className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">View Analytics</span>
                  </div>
                </button>
              </>
            ) : (
              <>
                <button className="w-full p-3 text-left bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiPlus} className="h-5 w-5 text-primary-600" />
                    <span className="text-sm font-medium text-primary-700">Add Team Resource</span>
                  </div>
                </button>
                <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiClock} className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Log Time Entry</span>
                  </div>
                </button>
                <button className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiCalendar} className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Weekly Time Entry</span>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Manager-specific resource overview */}
      {!isAdmin && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Team Resources</h3>
            <span className="text-sm text-gray-500">
              {getResourcesByManager(currentUser.id).length} team members
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getResourcesByManager(currentUser.id).map(resource => (
              <div key={resource.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={resource.avatar}
                  alt={resource.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{resource.name}</p>
                  <p className="text-xs text-gray-500">{resource.role}</p>
                  <p className="text-xs text-gray-400">40h/week</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin-specific project managers overview */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Project Managers</h3>
            <span className="text-sm text-gray-500">{projectManagers.length} managers</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectManagers.map(manager => {
              const managerResources = getResourcesByManager(manager.id);
              const managerTimeEntries = getTimeEntries({ managerId: manager.id });
              const totalHours = managerTimeEntries.reduce((sum, entry) => sum + (entry.actualHours || 0), 0);

              return (
                <div key={manager.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={manager.avatar}
                      alt={manager.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{manager.name}</p>
                      <p className="text-xs text-gray-500">{manager.department}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-white rounded">
                      <div className="font-medium text-gray-900">{managerResources.length}</div>
                      <div className="text-gray-500">Resources</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <div className="font-medium text-gray-900">{totalHours.toFixed(1)}h</div>
                      <div className="text-gray-500">Total Hours</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCapacity } from '../context/CapacityContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiUsers, FiFolderPlus, FiCalendar, FiBarChart3, FiClock, FiLink, FiSettings, FiActivity } = FiIcons;

function Sidebar() {
  const { currentUser, setUserRole } = useCapacity();

  const adminNavigation = [
    { name: 'Dashboard', href: '/', icon: FiHome },
    { name: 'Projects', href: '/projects', icon: FiFolderPlus },
    { name: 'All Resources', href: '/resources', icon: FiUsers },
    { name: 'Resource Utilization', href: '/resource-utilization', icon: FiActivity },
    { name: 'Time Tracking', href: '/time-tracking', icon: FiClock },
    { name: 'Reports', href: '/reports', icon: FiBarChart3 },
    { name: 'Analytics', href: '/analytics', icon: FiBarChart3 }
  ];

  const managerNavigation = [
    { name: 'Dashboard', href: '/', icon: FiHome },
    { name: 'My Resources', href: '/resources', icon: FiUsers },
    { name: 'Project Links', href: '/project-links', icon: FiLink },
    { name: 'Time Entry', href: '/time-entry', icon: FiClock },
    { name: 'Reports', href: '/reports', icon: FiBarChart3 },
    { name: 'Analytics', href: '/analytics', icon: FiBarChart3 }
  ];

  const navigation = currentUser.role === 'admin' ? adminNavigation : managerNavigation;

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    let userData = { role: newRole };

    // Update user data based on role
    if (newRole === 'project_manager') {
      userData = {
        ...userData,
        id: 1, // Sarah Johnson's ID
        name: 'Sarah Johnson',
        email: 'sarah@company.com'
      };
    } else {
      userData = {
        ...userData,
        id: 1,
        name: 'Admin User',
        email: 'admin@company.com'
      };
    }

    setUserRole(userData);
  };

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiBarChart3} className="h-8 w-8 text-primary-600" />
          <span className="text-xl font-bold text-gray-900">CapacityPro</span>
        </div>
      </div>

      {/* User Role Switcher */}
      <div className="p-4 border-b border-gray-200">
        <div className="text-xs text-gray-500 mb-2">Current Role</div>
        <div className="text-sm font-medium text-gray-900 capitalize">
          {currentUser.role === 'admin' ? 'Administrator' : 'Project Manager'}
        </div>
        <div className="text-xs text-gray-500">{currentUser.name}</div>
      </div>

      <nav className="mt-4 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <SafeIcon icon={item.icon} className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Role Switcher for Demo */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="text-xs text-gray-500 mb-2">Demo: Switch Role</div>
        <select
          value={currentUser.role}
          onChange={handleRoleChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="admin">Administrator</option>
          <option value="project_manager">Project Manager</option>
        </select>
      </div>
    </div>
  );
}

export default Sidebar;
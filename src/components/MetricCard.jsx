import React from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTrendingUp, FiTrendingDown } = FiIcons;

function MetricCard({ title, value, subtitle, icon, color, trend }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          
          {trend && (
            <div className="flex items-center mt-2">
              <SafeIcon 
                icon={trend.isPositive ? FiTrendingUp : FiTrendingDown} 
                className={`h-4 w-4 mr-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}
              />
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend.value).toFixed(1)}
              </span>
            </div>
          )}
        </div>
        
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <SafeIcon icon={icon} className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default MetricCard;
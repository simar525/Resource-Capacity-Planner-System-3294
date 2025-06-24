import React, { useState, useMemo } from 'react';
import { useCapacity } from '../context/CapacityContext';
import SafeIcon from '../common/SafeIcon';
import AnalyticsChart from '../components/AnalyticsChart';
import MetricCard from '../components/MetricCard';
import TrendChart from '../components/TrendChart';
import UtilizationHeatmap from '../components/UtilizationHeatmap';
import PredictiveAnalytics from '../components/PredictiveAnalytics';
import * as FiIcons from 'react-icons/fi';

const { FiBarChart3, FiTrendingUp, FiCalendar, FiFilter, FiDownload, FiRefreshCw, FiTarget, FiClock, FiUsers } = FiIcons;

function AdvancedAnalytics() {
  const { currentUser, getTimeEntries, getResourcesByManager, projects, resources, projectManagers } = useCapacity();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedMetric, setSelectedMetric] = useState('utilization');
  const [viewType, setViewType] = useState('overview');

  const isAdmin = currentUser.role === 'admin';

  // Get filtered data
  const timeEntries = useMemo(() => {
    return getTimeEntries({
      managerId: isAdmin ? undefined : currentUser.id,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    });
  }, [dateRange, currentUser.id, isAdmin, getTimeEntries]);

  // Calculate comprehensive metrics
  const analytics = useMemo(() => {
    const totalForecast = timeEntries.reduce((sum, entry) => sum + entry.forecastHours, 0);
    const totalActual = timeEntries.reduce((sum, entry) => sum + (entry.actualHours || 0), 0);
    const variance = totalActual - totalForecast;
    const accuracy = totalForecast > 0 ? (totalActual / totalForecast) * 100 : 0;

    // Resource utilization
    const resourceMetrics = resources.map(resource => {
      const resourceEntries = timeEntries.filter(entry => entry.resourceId === resource.id);
      const actualHours = resourceEntries.reduce((sum, entry) => sum + (entry.actualHours || 0), 0);
      const forecastHours = resourceEntries.reduce((sum, entry) => sum + entry.forecastHours, 0);
      const utilization = resource.capacity > 0 ? (actualHours / (resource.capacity * 4)) * 100 : 0; // 4 weeks

      return {
        resource,
        actualHours,
        forecastHours,
        utilization,
        efficiency: forecastHours > 0 ? (actualHours / forecastHours) * 100 : 0
      };
    });

    // Project performance
    const projectMetrics = projects.map(project => {
      const projectEntries = timeEntries.filter(entry => entry.projectId === project.id);
      const actualHours = projectEntries.reduce((sum, entry) => sum + (entry.actualHours || 0), 0);
      const forecastHours = projectEntries.reduce((sum, entry) => sum + entry.forecastHours, 0);
      const resourceCount = [...new Set(projectEntries.map(entry => entry.resourceId))].length;

      return {
        project,
        actualHours,
        forecastHours,
        resourceCount,
        efficiency: forecastHours > 0 ? (actualHours / forecastHours) * 100 : 0,
        variance: actualHours - forecastHours
      };
    });

    // Time trends
    const dailyTrends = {};
    timeEntries.forEach(entry => {
      const date = entry.date;
      if (!dailyTrends[date]) {
        dailyTrends[date] = { forecast: 0, actual: 0, entries: 0 };
      }
      dailyTrends[date].forecast += entry.forecastHours;
      dailyTrends[date].actual += entry.actualHours || 0;
      dailyTrends[date].entries += 1;
    });

    return {
      totalForecast,
      totalActual,
      variance,
      accuracy,
      resourceMetrics: resourceMetrics.filter(r => r.actualHours > 0 || r.forecastHours > 0),
      projectMetrics: projectMetrics.filter(p => p.actualHours > 0 || p.forecastHours > 0),
      dailyTrends,
      avgUtilization: resourceMetrics.length > 0 
        ? resourceMetrics.reduce((sum, r) => sum + r.utilization, 0) / resourceMetrics.length 
        : 0
    };
  }, [timeEntries, resources, projects]);

  const handleExport = () => {
    const data = {
      dateRange,
      analytics,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${dateRange.startDate}-to-${dateRange.endDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600">
            Comprehensive insights and predictive analytics for capacity management
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <SafeIcon icon={FiDownload} className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            <SafeIcon icon={FiRefreshCw} className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">View Type</label>
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="overview">Overview</option>
              <option value="resources">Resource Analysis</option>
              <option value="projects">Project Analysis</option>
              <option value="predictive">Predictive Analytics</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Metric Focus</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="utilization">Utilization</option>
              <option value="efficiency">Efficiency</option>
              <option value="variance">Variance Analysis</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Hours"
          value={analytics.totalActual.toFixed(1)}
          subtitle="hours logged"
          icon={FiClock}
          color="blue"
          trend={{
            value: analytics.variance,
            isPositive: analytics.variance >= 0
          }}
        />
        <MetricCard
          title="Avg Utilization"
          value={analytics.avgUtilization.toFixed(1)}
          subtitle="% capacity used"
          icon={FiTarget}
          color="green"
          trend={{
            value: analytics.accuracy - 100,
            isPositive: Math.abs(analytics.accuracy - 100) < 10
          }}
        />
        <MetricCard
          title="Forecast Accuracy"
          value={analytics.accuracy.toFixed(1)}
          subtitle="% accuracy"
          icon={FiTrendingUp}
          color="purple"
          trend={{
            value: analytics.accuracy - 100,
            isPositive: Math.abs(analytics.accuracy - 100) < 10
          }}
        />
        <MetricCard
          title="Active Resources"
          value={analytics.resourceMetrics.length}
          subtitle="team members"
          icon={FiUsers}
          color="orange"
          trend={{
            value: analytics.variance <= 0 ? 5 : -5,
            isPositive: analytics.variance <= 0
          }}
        />
      </div>

      {/* Main Content Based on View Type */}
      {viewType === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Time Trends</h3>
            </div>
            <div className="p-6">
              <TrendChart data={analytics.dailyTrends} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Resource Utilization</h3>
            </div>
            <div className="p-6">
              <AnalyticsChart
                data={analytics.resourceMetrics}
                type="bar"
                xKey="resource.name"
                yKey="utilization"
                title="Utilization %"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Project Performance</h3>
            </div>
            <div className="p-6">
              <AnalyticsChart
                data={analytics.projectMetrics}
                type="scatter"
                xKey="forecastHours"
                yKey="actualHours"
                title="Forecast vs Actual Hours"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Hours Distribution</h3>
            </div>
            <div className="p-6">
              <AnalyticsChart
                data={analytics.resourceMetrics}
                type="pie"
                valueKey="actualHours"
                nameKey="resource.name"
                title="Hours Distribution"
              />
            </div>
          </div>
        </div>
      )}

      {viewType === 'resources' && (
        <div className="space-y-6">
          <UtilizationHeatmap
            resources={analytics.resourceMetrics}
            timeEntries={timeEntries}
            dateRange={dateRange}
          />

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Resource Performance Matrix</h3>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.resourceMetrics.map((metric, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <img
                            src={metric.resource.avatar}
                            alt={metric.resource.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{metric.resource.name}</div>
                            <div className="text-sm text-gray-500">{metric.resource.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${
                                metric.utilization > 100 ? 'bg-red-500' :
                                metric.utilization > 90 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(metric.utilization, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{metric.utilization.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{metric.efficiency.toFixed(1)}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{metric.resource.capacity}h/week</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          metric.utilization > 100 ? 'bg-red-100 text-red-800' :
                          metric.utilization > 90 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {metric.utilization > 100 ? 'Overutilized' :
                           metric.utilization > 90 ? 'High Utilization' : 'Optimal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {viewType === 'projects' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Project Efficiency</h3>
              </div>
              <div className="p-6">
                <AnalyticsChart
                  data={analytics.projectMetrics}
                  type="bar"
                  xKey="project.name"
                  yKey="efficiency"
                  title="Efficiency %"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Resource Allocation</h3>
              </div>
              <div className="p-6">
                <AnalyticsChart
                  data={analytics.projectMetrics}
                  type="bubble"
                  xKey="actualHours"
                  yKey="resourceCount"
                  sizeKey="forecastHours"
                  title="Hours vs Resources"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Project Performance Summary</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analytics.projectMetrics.map((metric, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">{metric.project.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        metric.efficiency > 110 ? 'bg-red-100 text-red-800' :
                        metric.efficiency > 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {metric.efficiency.toFixed(0)}% efficient
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Forecast:</span>
                        <span className="font-medium">{metric.forecastHours.toFixed(1)}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Actual:</span>
                        <span className="font-medium">{metric.actualHours.toFixed(1)}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Variance:</span>
                        <span className={`font-medium ${metric.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {metric.variance >= 0 ? '+' : ''}{metric.variance.toFixed(1)}h
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Resources:</span>
                        <span className="font-medium">{metric.resourceCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewType === 'predictive' && (
        <PredictiveAnalytics
          timeEntries={timeEntries}
          resources={analytics.resourceMetrics}
          projects={analytics.projectMetrics}
          dateRange={dateRange}
        />
      )}
    </div>
  );
}

export default AdvancedAnalytics;
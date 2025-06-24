import React, { useMemo } from 'react';
import SafeIcon from '../common/SafeIcon';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';

const { FiTrendingUp, FiAlertTriangle, FiTarget, FiBrain } = FiIcons;

function PredictiveAnalytics({ timeEntries, resources, projects, dateRange }) {
  const predictions = useMemo(() => {
    if (!timeEntries || timeEntries.length === 0) {
      return null;
    }

    // Calculate trends and predictions
    const totalDays = Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24));
    const avgDailyHours = timeEntries.reduce((sum, entry) => sum + (entry.actualHours || 0), 0) / totalDays;
    
    // Resource burnout risk analysis
    const burnoutRisk = resources.map(resource => {
      const utilizationTrend = resource.utilization;
      const efficiencyTrend = resource.efficiency;
      
      let riskLevel = 'low';
      let riskScore = 0;
      
      if (utilizationTrend > 90) riskScore += 30;
      if (efficiencyTrend < 80) riskScore += 20;
      if (utilizationTrend > 100) riskScore += 40;
      
      if (riskScore >= 50) riskLevel = 'high';
      else if (riskScore >= 30) riskLevel = 'medium';
      
      return {
        resource: resource.resource,
        riskLevel,
        riskScore,
        recommendation: getRiskRecommendation(riskLevel, utilizationTrend)
      };
    });

    // Project completion prediction
    const projectPredictions = projects.map(project => {
      const efficiency = project.efficiency;
      const remainingHours = Math.max(0, project.forecastHours - project.actualHours);
      const adjustedHours = remainingHours * (efficiency / 100);
      
      return {
        project: project.project,
        predictedCompletion: adjustedHours,
        confidenceLevel: Math.min(95, Math.max(60, efficiency - 10)),
        onTrack: Math.abs(efficiency - 100) <= 15
      };
    });

    return {
      avgDailyHours,
      burnoutRisk: burnoutRisk.filter(r => r.riskLevel !== 'low'),
      projectPredictions,
      nextWeekForecast: avgDailyHours * 7 * 1.1, // 10% growth assumption
      capacityRecommendations: generateCapacityRecommendations(resources, burnoutRisk)
    };
  }, [timeEntries, resources, projects, dateRange]);

  const getRiskRecommendation = (riskLevel, utilization) => {
    switch (riskLevel) {
      case 'high':
        return 'Immediate action needed: Reduce workload or add resources';
      case 'medium':
        return utilization > 90 ? 'Monitor closely and consider workload adjustment' : 'Provide additional support';
      default:
        return 'Continue current allocation';
    }
  };

  const generateCapacityRecommendations = (resources, burnoutRisk) => {
    const recommendations = [];
    
    const highRiskCount = burnoutRisk.filter(r => r.riskLevel === 'high').length;
    const totalResources = resources.length;
    
    if (highRiskCount > totalResources * 0.3) {
      recommendations.push({
        type: 'critical',
        message: 'Consider hiring additional resources - 30%+ of team at high burnout risk'
      });
    }
    
    if (resources.some(r => r.utilization < 50)) {
      recommendations.push({
        type: 'optimization',
        message: 'Some resources are underutilized - consider workload rebalancing'
      });
    }
    
    return recommendations;
  };

  if (!predictions) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <SafeIcon icon={FiBrain} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Prediction Data</h3>
          <p className="text-gray-600">Add time entries to generate predictive analytics</p>
        </div>
      </div>
    );
  }

  const forecastChartOption = {
    title: { text: 'Capacity Forecast', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['Historical', 'Predicted'], top: 30 },
    xAxis: {
      type: 'category',
      data: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Next Week (Predicted)']
    },
    yAxis: { type: 'value', name: 'Hours' },
    series: [
      {
        name: 'Historical',
        type: 'line',
        data: [predictions.avgDailyHours * 7, predictions.avgDailyHours * 7, predictions.avgDailyHours * 7, predictions.avgDailyHours * 7, null],
        itemStyle: { color: '#3b82f6' }
      },
      {
        name: 'Predicted',
        type: 'line',
        data: [null, null, null, predictions.avgDailyHours * 7, predictions.nextWeekForecast],
        itemStyle: { color: '#f59e0b' },
        lineStyle: { type: 'dashed' }
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Forecast Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Capacity Forecast</h3>
        </div>
        <div className="p-6">
          <div className="w-full h-80">
            <ReactECharts option={forecastChartOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Risk Analysis */}
      {predictions.burnoutRisk.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiAlertTriangle} className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-medium text-gray-900">Burnout Risk Analysis</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {predictions.burnoutRisk.map((risk, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  risk.riskLevel === 'high' ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={risk.resource.avatar} 
                        alt={risk.resource.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <span className="font-medium text-gray-900">{risk.resource.name}</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          risk.riskLevel === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {risk.riskLevel.toUpperCase()} RISK
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">Risk Score: {risk.riskScore}</span>
                  </div>
                  <p className="text-sm text-gray-700">{risk.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Project Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Project Completion Predictions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {predictions.projectPredictions.map((prediction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">{prediction.project.name}</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <SafeIcon 
                        icon={prediction.onTrack ? FiTarget : FiAlertTriangle} 
                        className={`h-4 w-4 ${prediction.onTrack ? 'text-green-500' : 'text-yellow-500'}`}
                      />
                      <span className="text-sm text-gray-600">
                        {prediction.onTrack ? 'On Track' : 'Needs Attention'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {prediction.predictedCompletion.toFixed(1)}h remaining
                    </div>
                    <div className="text-xs text-gray-500">
                      {prediction.confidenceLevel}% confidence
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">AI Recommendations</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {predictions.capacityRecommendations.map((rec, index) => (
                <div key={index} className={`p-4 rounded-lg ${
                  rec.type === 'critical' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    <SafeIcon 
                      icon={rec.type === 'critical' ? FiAlertTriangle : FiTrendingUp} 
                      className={`h-5 w-5 mt-0.5 ${
                        rec.type === 'critical' ? 'text-red-500' : 'text-blue-500'
                      }`}
                    />
                    <div>
                      <span className={`text-sm font-medium ${
                        rec.type === 'critical' ? 'text-red-800' : 'text-blue-800'
                      }`}>
                        {rec.type === 'critical' ? 'Critical Action Required' : 'Optimization Opportunity'}
                      </span>
                      <p className={`text-sm mt-1 ${
                        rec.type === 'critical' ? 'text-red-700' : 'text-blue-700'
                      }`}>
                        {rec.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {predictions.capacityRecommendations.length === 0 && (
                <div className="text-center py-6">
                  <SafeIcon icon={FiTarget} className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">All systems optimal! No immediate actions needed.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PredictiveAnalytics;
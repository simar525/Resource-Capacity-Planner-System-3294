import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

function UtilizationHeatmap({ resources, timeEntries, dateRange }) {
  const option = useMemo(() => {
    if (!resources || resources.length === 0 || !timeEntries || timeEntries.length === 0) {
      return {
        title: { text: 'No utilization data available', left: 'center', top: 'center' }
      };
    }

    // Generate date range
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const dates = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0]);
    }

    // Prepare data for heatmap
    const heatmapData = [];
    const resourceNames = resources.map(r => r.resource.name);
    
    resources.forEach((resourceMetric, resourceIndex) => {
      dates.forEach((date, dateIndex) => {
        const dayEntries = timeEntries.filter(entry => 
          entry.resourceId === resourceMetric.resource.id && entry.date === date
        );
        
        const totalHours = dayEntries.reduce((sum, entry) => sum + (entry.actualHours || 0), 0);
        const utilization = resourceMetric.resource.capacity > 0 ? 
          (totalHours / (resourceMetric.resource.capacity / 5)) * 100 : 0; // Daily capacity
        
        heatmapData.push([dateIndex, resourceIndex, Math.round(utilization)]);
      });
    });

    return {
      title: { text: 'Resource Utilization Heatmap', left: 'center' },
      tooltip: {
        position: 'top',
        formatter: function (params) {
          const date = dates[params.data[0]];
          const resource = resourceNames[params.data[1]];
          const utilization = params.data[2];
          return `${resource}<br/>${new Date(date).toLocaleDateString()}<br/>Utilization: ${utilization}%`;
        }
      },
      grid: {
        height: '60%',
        top: '10%'
      },
      xAxis: {
        type: 'category',
        data: dates.map(date => new Date(date).toLocaleDateString()),
        splitArea: { show: true },
        axisLabel: { rotate: 45 }
      },
      yAxis: {
        type: 'category',
        data: resourceNames,
        splitArea: { show: true }
      },
      visualMap: {
        min: 0,
        max: 120,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%',
        inRange: {
          color: ['#50f', '#06f', '#0df', '#6f0', '#ff0', '#f90', '#f00']
        }
      },
      series: [{
        name: 'Utilization',
        type: 'heatmap',
        data: heatmapData,
        label: {
          show: false
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  }, [resources, timeEntries, dateRange]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Utilization Heatmap</h3>
        <p className="text-sm text-gray-600">Daily utilization patterns across resources</p>
      </div>
      <div className="p-6">
        <div className="w-full h-96">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
    </div>
  );
}

export default UtilizationHeatmap;
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

function TrendChart({ data }) {
  const option = useMemo(() => {
    if (!data || Object.keys(data).length === 0) {
      return {
        title: { text: 'No trend data available', left: 'center', top: 'center' }
      };
    }

    const dates = Object.keys(data).sort();
    const forecastData = dates.map(date => data[date].forecast);
    const actualData = dates.map(date => data[date].actual);

    return {
      title: { text: 'Daily Time Trends', left: 'center' },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['Forecast', 'Actual'],
        top: 30
      },
      xAxis: {
        type: 'category',
        data: dates.map(date => new Date(date).toLocaleDateString()),
        axisLabel: { rotate: 45 }
      },
      yAxis: {
        type: 'value',
        name: 'Hours'
      },
      series: [
        {
          name: 'Forecast',
          type: 'line',
          data: forecastData,
          smooth: true,
          itemStyle: { color: '#3b82f6' },
          lineStyle: { color: '#3b82f6' }
        },
        {
          name: 'Actual',
          type: 'line',
          data: actualData,
          smooth: true,
          itemStyle: { color: '#10b981' },
          lineStyle: { color: '#10b981' }
        }
      ]
    };
  }, [data]);

  return (
    <div className="w-full h-80">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

export default TrendChart;
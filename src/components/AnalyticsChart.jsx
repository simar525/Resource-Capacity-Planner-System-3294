import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

function AnalyticsChart({ data, type, xKey, yKey, sizeKey, valueKey, nameKey, title }) {
  const option = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        title: { text: 'No data available', left: 'center', top: 'center' }
      };
    }

    const getNestedValue = (obj, key) => {
      return key.split('.').reduce((o, k) => o && o[k], obj);
    };

    switch (type) {
      case 'bar':
        return {
          title: { text: title, left: 'center' },
          tooltip: { trigger: 'axis' },
          xAxis: {
            type: 'category',
            data: data.map(item => getNestedValue(item, xKey)),
            axisLabel: { rotate: 45 }
          },
          yAxis: { type: 'value' },
          series: [{
            data: data.map(item => getNestedValue(item, yKey)),
            type: 'bar',
            itemStyle: {
              color: (params) => {
                const value = params.value;
                if (value > 100) return '#ef4444';
                if (value > 90) return '#f59e0b';
                return '#10b981';
              }
            }
          }]
        };

      case 'scatter':
        return {
          title: { text: title, left: 'center' },
          tooltip: { trigger: 'item' },
          xAxis: { type: 'value', name: 'Forecast Hours' },
          yAxis: { type: 'value', name: 'Actual Hours' },
          series: [{
            data: data.map(item => [
              getNestedValue(item, xKey),
              getNestedValue(item, yKey)
            ]),
            type: 'scatter',
            symbolSize: 8,
            itemStyle: { color: '#3b82f6' }
          }, {
            // Perfect correlation line
            data: [[0, 0], [Math.max(...data.map(item => getNestedValue(item, xKey))), Math.max(...data.map(item => getNestedValue(item, xKey)))]],
            type: 'line',
            lineStyle: { color: '#ef4444', type: 'dashed' },
            symbol: 'none',
            silent: true
          }]
        };

      case 'pie':
        return {
          title: { text: title, left: 'center' },
          tooltip: { trigger: 'item' },
          series: [{
            type: 'pie',
            radius: '50%',
            data: data.map(item => ({
              value: getNestedValue(item, valueKey),
              name: getNestedValue(item, nameKey)
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }]
        };

      case 'bubble':
        return {
          title: { text: title, left: 'center' },
          tooltip: { trigger: 'item' },
          xAxis: { type: 'value', name: 'Actual Hours' },
          yAxis: { type: 'value', name: 'Resource Count' },
          series: [{
            data: data.map(item => [
              getNestedValue(item, xKey),
              getNestedValue(item, yKey),
              getNestedValue(item, sizeKey)
            ]),
            type: 'scatter',
            symbolSize: (data) => Math.sqrt(data[2]) * 3,
            itemStyle: { color: '#8b5cf6', opacity: 0.7 }
          }]
        };

      default:
        return { title: { text: 'Unsupported chart type', left: 'center' } };
    }
  }, [data, type, xKey, yKey, sizeKey, valueKey, nameKey, title]);

  return (
    <div className="w-full h-80">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

export default AnalyticsChart;
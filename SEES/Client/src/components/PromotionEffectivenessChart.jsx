import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function PromotionEffectivenessChart({ levels, attendanceIncrease, conversionRates, roi }) {
  const [metric, setMetric] = useState('attendance'); // 'attendance', 'conversion', 'roi'
  
  const getDataForMetric = () => {
    switch (metric) {
      case 'attendance':
        return {
          data: attendanceIncrease,
          label: 'Attendance Increase (%)',
          backgroundColor: ['rgba(255, 206, 86, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(153, 102, 255, 0.6)'],
          borderColor: ['rgba(255, 206, 86, 1)', 'rgba(54, 162, 235, 1)', 'rgba(153, 102, 255, 1)']
        };
      case 'conversion':
        return {
          data: conversionRates,
          label: 'Conversion Rate (%)',
          backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(255, 159, 64, 0.6)', 'rgba(255, 205, 86, 0.6)'],
          borderColor: ['rgba(255, 99, 132, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 205, 86, 1)']
        };
      case 'roi':
        return {
          data: roi,
          label: 'Return on Investment (%)',
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(153, 102, 255, 0.6)'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(54, 162, 235, 1)', 'rgba(153, 102, 255, 1)']
        };
      default:
        return {
          data: attendanceIncrease,
          label: 'Attendance Increase (%)',
          backgroundColor: ['rgba(255, 206, 86, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(153, 102, 255, 0.6)'],
          borderColor: ['rgba(255, 206, 86, 1)', 'rgba(54, 162, 235, 1)', 'rgba(153, 102, 255, 1)']
        };
    }
  };
  
  const metricData = getDataForMetric();
  
  const data = {
    labels: levels,
    datasets: [
      {
        label: metricData.label,
        data: metricData.data,
        backgroundColor: metricData.backgroundColor,
        borderColor: metricData.borderColor,
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + '%';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setMetric('attendance')}
          style={{
            padding: '5px 10px',
            background: metric === 'attendance' ? '#4a90e2' : '#f0f0f0',
            color: metric === 'attendance' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Attendance
        </button>
        <button 
          onClick={() => setMetric('conversion')}
          style={{
            padding: '5px 10px',
            background: metric === 'conversion' ? '#4a90e2' : '#f0f0f0',
            color: metric === 'conversion' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Conversion
        </button>
        <button 
          onClick={() => setMetric('roi')}
          style={{
            padding: '5px 10px',
            background: metric === 'roi' ? '#4a90e2' : '#f0f0f0',
            color: metric === 'roi' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ROI
        </button>
      </div>
      <div style={{ height: '265px', width: '100%' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

export default PromotionEffectivenessChart;
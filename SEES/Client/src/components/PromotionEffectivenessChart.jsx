import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
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

function PromotionEffectivenessChart({ data }) {
  // Extract labels and values from data prop
  const labels = data?.labels || [];
  const values = data?.values || [];
  
  // Return placeholder if no data
  if (labels.length === 0 || values.length === 0) {
    return <div className="chart-placeholder">No promotion data available</div>;
  }
  
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Number of Events',
        data: values,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  console.log('PromotionEffectivenessChart rendering with data:', chartData);

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default PromotionEffectivenessChart;
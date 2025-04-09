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

function AttendanceChart({ data }) {
  // Extract data from props
  const labels = data?.labels || [];
  const capacity = data?.capacity || [];
  const attendees = data?.attendees || [];
  
  // Return placeholder if no data
  if (labels.length === 0) {
    return <div className="chart-placeholder">No attendance data available</div>;
  }
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Capacity',
        data: capacity,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Attendees',
        data: attendees,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
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
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  console.log('AttendanceChart rendering with data:', chartData);

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default AttendanceChart;
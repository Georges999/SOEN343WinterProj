import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { 
  getAnalyticsSummary, 
  getAttendanceAnalytics, 
  getRevenueAnalytics, 
  getPromotionAnalytics 
} from '../services/api';

// Import chart components
import EventPopularityChart from '../components/EventPopularityChart'; // Fix typo in file name too
import AttendanceChart from '../components/AttendanceChart';
import RevenueChart from '../components/RevenueChart';
import PromotionEffectivenessChart from '../components/PromotionEffectivenessChart';
import CategoryDistributionChart from '../components/CategoryDistributionChart';

function AdminAnalytics({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('month'); // week, month, year
  const [summaryData, setSummaryData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [promotionData, setPromotionData] = useState(null);
  
  useEffect(() => {
    // Redirect if not admin
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    
    fetchAnalyticsData();
  }, [user, navigate, timeRange]);
  
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // In a real implementation, you'd use the actual API calls:
      // const summary = await getAnalyticsSummary();
      // const attendance = await getAttendanceAnalytics();
      // const revenue = await getRevenueAnalytics();
      // const promotion = await getPromotionAnalytics();
      
      // For demonstration, we'll use mock data instead
      const summary = generateMockSummaryData();
      const attendance = generateMockAttendanceData();
      const revenue = generateMockRevenueData();
      const promotion = generateMockPromotionData();
      
      setSummaryData(summary);
      setAttendanceData(attendance);
      setRevenueData(revenue);
      setPromotionData(promotion);
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };
  
  // Generate mock data for demonstration
  const generateMockSummaryData = () => {
    let dateRange;
    let labels = [];
    
    if (timeRange === 'week') {
      dateRange = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        labels.push(format(date, 'EEE'));
        return date;
      });
    } else if (timeRange === 'month') {
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());
      const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      
      dateRange = Array.from({ length: days }, (_, i) => {
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        labels.push(format(date, 'd MMM'));
        return date;
      });
    } else { // year
      dateRange = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(new Date().getFullYear(), i, 1);
        labels.push(format(date, 'MMM'));
        return date;
      });
    }
    
    // Generate event counts
    const eventCounts = dateRange.map(() => Math.floor(Math.random() * 5) + 1);
    const registrationCounts = dateRange.map(() => Math.floor(Math.random() * 25) + 5);
    
    return {
      totalEvents: eventCounts.reduce((a, b) => a + b, 0),
      totalAttendees: registrationCounts.reduce((a, b) => a + b, 0),
      totalRevenue: Math.floor(Math.random() * 5000) + 1000,
      labels,
      eventData: eventCounts,
      registrationData: registrationCounts
    };
  };
  
  const generateMockAttendanceData = () => {
    const eventNames = ['Workshop A', 'Conference B', 'Seminar C', 'Networking D', 'Lecture E'];
    const capacities = eventNames.map(() => Math.floor(Math.random() * 50) + 50);
    const attendees = capacities.map(cap => Math.floor(Math.random() * cap));
    const attendanceRates = attendees.map((att, i) => (att / capacities[i] * 100).toFixed(1));
    
    return {
      events: eventNames,
      capacities,
      attendees,
      attendanceRates
    };
  };
  
  const generateMockRevenueData = () => {
    // Use the same labels as summary data for consistency
    const labels = summaryData ? summaryData.labels : [];
    
    // Generate revenue data
    const registrationRevenue = labels.map(() => Math.floor(Math.random() * 300) + 50);
    const promotionRevenue = labels.map(() => Math.floor(Math.random() * 200) + 30);
    const totalRevenue = registrationRevenue.map((reg, i) => reg + promotionRevenue[i]);
    
    return {
      labels,
      registrationRevenue,
      promotionRevenue,
      totalRevenue,
      total: {
        registration: registrationRevenue.reduce((a, b) => a + b, 0),
        promotion: promotionRevenue.reduce((a, b) => a + b, 0)
      }
    };
  };
  
  const generateMockPromotionData = () => {
    const promotionLevels = ['Basic', 'Premium', 'Featured'];
    const attendanceIncrease = [15, 35, 60]; // percentage increase
    const conversionRates = [5, 12, 25]; // percentage
    const roi = [120, 180, 220]; // percentage return on investment
    
    // Event category distribution
    const categories = ['Workshop', 'Lecture', 'Seminar', 'Conference', 'Networking', 'Other'];
    const categoryDistribution = categories.map(() => Math.floor(Math.random() * 30) + 5);
    
    return {
      promotionLevels,
      attendanceIncrease,
      conversionRates,
      roi,
      categories,
      categoryDistribution
    };
  };
  
  if (loading) return <div className="loading">Loading analytics data...</div>;
  
  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="time-range-selector">
          <button 
            className={`time-range-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Past Week
          </button>
          <button 
            className={`time-range-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            This Month
          </button>
          <button 
            className={`time-range-btn ${timeRange === 'year' ? 'active' : ''}`}
            onClick={() => setTimeRange('year')}
          >
            This Year
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="analytics-summary">
        <div className="summary-card">
          <div className="summary-value">{summaryData?.totalEvents || 0}</div>
          <div className="summary-label">Total Events</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{summaryData?.totalAttendees || 0}</div>
          <div className="summary-label">Total Attendees</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">${summaryData?.totalRevenue || 0}</div>
          <div className="summary-label">Total Revenue</div>
        </div>
      </div>
      
      <div className="analytics-grid">
        {/* Event Popularity Chart */}
        <div className="chart-container">
          <h2>Event Popularity</h2>
          <EventPopularityChart 
            labels={summaryData?.labels || []}
            eventData={summaryData?.eventData || []}
            registrationData={summaryData?.registrationData || []}
          />
        </div>
        
        {/* Attendance Chart */}
        <div className="chart-container">
          <h2>Attendance Metrics</h2>
          <AttendanceChart 
            events={attendanceData?.events || []}
            capacities={attendanceData?.capacities || []}
            attendees={attendanceData?.attendees || []}
          />
        </div>
        
        {/* Revenue Chart */}
        <div className="chart-container">
          <h2>Revenue Breakdown</h2>
          <RevenueChart 
            labels={revenueData?.labels || []}
            registrationRevenue={revenueData?.registrationRevenue || []}
            promotionRevenue={revenueData?.promotionRevenue || []}
          />
          <div className="revenue-summary">
            <div className="revenue-item">
              <span className="revenue-label">Registration Revenue:</span>
              <span className="revenue-value">${revenueData?.total?.registration || 0}</span>
            </div>
            <div className="revenue-item">
              <span className="revenue-label">Promotion Revenue:</span>
              <span className="revenue-value">${revenueData?.total?.promotion || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Promotion Effectiveness Chart */}
        <div className="chart-container">
          <h2>Promotion Effectiveness</h2>
          <PromotionEffectivenessChart 
            levels={promotionData?.promotionLevels || []}
            attendanceIncrease={promotionData?.attendanceIncrease || []}
            conversionRates={promotionData?.conversionRates || []}
            roi={promotionData?.roi || []}
          />
        </div>
        
        {/* Event Category Distribution */}
        <div className="chart-container">
          <h2>Event Category Distribution</h2>
          <CategoryDistributionChart 
            categories={promotionData?.categories || []}
            distribution={promotionData?.categoryDistribution || []}
          />
        </div>
      </div>
      
      <style jsx>{`
        .analytics-dashboard {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .time-range-selector {
          display: flex;
          gap: 10px;
        }
        
        .time-range-btn {
          padding: 8px 16px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .time-range-btn.active {
          background: #4a90e2;
          color: white;
          border-color: #4a90e2;
        }
        
        .analytics-summary {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .summary-card {
          flex: 1;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }
        
        .summary-value {
          font-size: 2.5rem;
          font-weight: bold;
          color: #4a90e2;
        }
        
        .summary-label {
          font-size: 1rem;
          color: #666;
        }
        
        .analytics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .chart-container {
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-radius: 8px;
          padding: 20px;
          min-height: 350px;
        }
        
        .chart-container h2 {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 1.2rem;
          color: #333;
        }
        
        .revenue-summary {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }
        
        .revenue-item {
          display: flex;
          flex-direction: column;
        }
        
        .revenue-label {
          font-size: 0.9rem;
          color: #666;
        }
        
        .revenue-value {
          font-size: 1.2rem;
          font-weight: bold;
          color: #4a90e2;
        }
        
        @media (max-width: 1024px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }
          
          .analytics-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminAnalytics;
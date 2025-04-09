import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAnalyticsSummary, 
  getAttendanceAnalytics, 
  getRevenueAnalytics, 
  getPromotionAnalytics,
  getEventsCreated
} from '../services/api';

// Import chart components
import EventPopularityChart from '../components/EventPopularityChart'; 
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
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    // Redirect if not admin
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    
    // Fetch all events first
    const fetchEvents = async () => {
      try {
        const eventsData = await getEventsCreated();
        setEvents(eventsData);
        
        // Now that we have events, fetch analytics data
        await fetchAnalyticsData(eventsData);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Failed to load events data");
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [user, navigate, timeRange]);
  
  const fetchAnalyticsData = async (eventsData) => {
    try {
      setLoading(true);
      setError('');
      
      let summary, attendance, revenue, promotion;
      
      try {
        // Try API calls first
        summary = await getAnalyticsSummary(timeRange);
        console.log('Raw summary data from API:', summary);
        
        attendance = await getAttendanceAnalytics(timeRange);
        console.log('Raw attendance data from API:', attendance);
        
        revenue = await getRevenueAnalytics(timeRange);
        console.log('Raw revenue data from API:', revenue);
        
        promotion = await getPromotionAnalytics(timeRange);
        console.log('Raw promotion data from API:', promotion);

        // CRITICAL FIX: Calculate total attendees directly from events data
        // This matches the calculation in AdminPanel.jsx
        const totalAttendees = eventsData.reduce((sum, event) => sum + (event.attendees?.length || 0), 0);
        console.log('Calculated total attendees from events:', totalAttendees);
        
        // Add diagnostic logging
        console.log('Data integrity check:', {
          summaryValid: summary && typeof summary === 'object',
          calculatedAttendees: totalAttendees,
          backendAttendees: summary?.totalAttendees,
          totalEvents: summary?.totalEvents,
          totalRevenue: summary?.totalRevenue,
          hasLabels: Array.isArray(summary?.labels),
          promotionValid: promotion && typeof promotion === 'object',
          hasCategoryCount: promotion && typeof promotion.categoryCount === 'object',
          hasPromotionLevels: promotion && typeof promotion.promotionLevels === 'object'
        });
  
        // Set summary data with our locally calculated attendees value
        if (summary && typeof summary === 'object') {
          setSummaryData({
            totalEvents: summary.totalEvents || 0,
            totalAttendees: totalAttendees, // Use our locally calculated value
            totalRevenue: summary.totalRevenue || 0,
            labels: Array.isArray(summary.labels) ? summary.labels : [],
            eventData: Array.isArray(summary.eventData) ? summary.eventData : [],
            registrationData: Array.isArray(summary.registrationData) ? summary.registrationData : []
          });
          
          console.log('Using attendee count from events data:', totalAttendees);
        } else {
          console.warn('Summary data from API is not valid:', summary);
          setSummaryData({
            totalEvents: 0,
            totalAttendees: totalAttendees, // Still use our calculated value
            totalRevenue: 0,
            labels: [],
            eventData: [],
            registrationData: []
          });
        }
        
        // Process attendance data directly from backend
        if (attendance && typeof attendance === 'object') {
          setAttendanceData({
            labels: Array.isArray(attendance.labels) ? attendance.labels : [],
            capacity: Array.isArray(attendance.capacity) ? attendance.capacity : [],
            attendees: Array.isArray(attendance.attendees) ? attendance.attendees : []
          });
        } else {
          console.warn('Attendance data from API is not valid:', attendance);
          setAttendanceData({
            labels: [],
            capacity: [],
            attendees: []
          });
        }
        
        // Process revenue data directly from backend
        if (revenue && typeof revenue === 'object') {
          setRevenueData({
            labels: Array.isArray(revenue.labels) ? revenue.labels : [],
            registration: Array.isArray(revenue.registration) ? revenue.registration : [],
            promotion: Array.isArray(revenue.promotion) ? revenue.promotion : []
          });
        } else {
          console.warn('Revenue data from API is not valid:', revenue);
          setRevenueData({
            labels: [],
            registration: [],
            promotion: []
          });
        }
        
        // Process promotion data directly from backend
        if (promotion && typeof promotion === 'object') {
          setPromotionData({
            categoryLabels: promotion.categoryCount ? Object.keys(promotion.categoryCount) : [],
            categoryValues: promotion.categoryCount ? Object.values(promotion.categoryCount) : [],
            levelLabels: promotion.promotionLevels ? Object.keys(promotion.promotionLevels) : [],
            levelValues: promotion.promotionLevels ? Object.values(promotion.promotionLevels) : []
          });
        } else {
          console.warn('Promotion data from API is not valid:', promotion);
          setPromotionData({
            categoryLabels: [],
            categoryValues: [],
            levelLabels: [],
            levelValues: []
          });
        }
        
      } catch (apiError) {
        console.error('API error details:', apiError);
        console.log('API error, using mock data as fallback');
        
        // Calculate attendees even in fallback mode
        const totalAttendees = eventsData.reduce((sum, event) => sum + (event.attendees?.length || 0), 0);
        
        // Mock data for fallback - only use if the API fails completely
        setSummaryData({
          totalEvents: eventsData.length,
          totalAttendees: totalAttendees, // Use our calculated value here too
          totalRevenue: 0,
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          eventData: [0, 0, 0, 0],
          registrationData: [0, 0, 0, 0]
        });
        
        setAttendanceData({
          labels: ['No Data Available'],
          capacity: [0],
          attendees: [0]
        });
        
        setRevenueData({
          totalRevenue: 0,
          labels: ['No Data'],
          registration: [0],
          promotion: [0]
        });
        
        setPromotionData({
          categoryLabels: ['No Data'],
          categoryValues: [0],
          levelLabels: ['No Data'],
          levelValues: [0]
        });
      }
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // The rest of your component remains the same
  return (
    <div className="admin-analytics">
      <h1>Analytics Dashboard</h1>
      
      {/* Time range selector */}
      <div className="time-range-selector">
        <button 
          className={timeRange === 'week' ? 'active' : ''} 
          onClick={() => setTimeRange('week')}
        >
          Last Week
        </button>
        <button 
          className={timeRange === 'month' ? 'active' : ''} 
          onClick={() => setTimeRange('month')}
        >
          Last Month
        </button>
        <button 
          className={timeRange === 'year' ? 'active' : ''} 
          onClick={() => setTimeRange('year')}
        >
          Last Year
        </button>
      </div>
      
      {loading && <div className="loading">Loading analytics data...</div>}
      
      {error && <div className="error">{error}</div>}
      
      {!loading && !error && (
        <div className="analytics-grid">
          {/* Summary Section */}
          <div className="analytics-card summary-card">
            <h2>Key Metrics</h2>
            <div className="metrics">
              <div className="metric">
                <h3>{summaryData?.totalEvents !== undefined ? summaryData.totalEvents : 0}</h3>
                <p>Events Created</p>
              </div>
              <div className="metric">
                <h3>{summaryData?.totalAttendees !== undefined ? summaryData.totalAttendees : 0}</h3>
                <p>Total Attendees</p>
              </div>
              <div className="metric">
                <h3>${summaryData?.totalRevenue !== undefined ? summaryData.totalRevenue : 0}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
          </div>
          
       {/* Event Growth Chart */}
       <div className="analytics-card">
            <h2>Event & Registration Growth</h2>
            <EventPopularityChart data={{
              labels: summaryData?.labels || [],
              eventData: summaryData?.eventData || [],
              registrationData: summaryData?.registrationData || []
            }} />
          </div>
          
          {/* Attendance Chart */}
          <div className="analytics-card">
            <h2>Event Attendance</h2>
            <AttendanceChart data={attendanceData} />
          </div>
          
          {/* Revenue Chart */}
          <div className="analytics-card">
            <h2>Revenue Breakdown</h2>
            <RevenueChart data={revenueData} />
          </div>
          
          {/* Category Distribution Chart */}
          <div className="analytics-card">
            <h2>Event Categories</h2>
            <CategoryDistributionChart data={{
              labels: promotionData?.categoryLabels || [],
              values: promotionData?.categoryValues || []
            }} />
          </div>
          
          {/* Promotion Effectiveness Chart */}
          <div className="analytics-card">
            <h2>Promotion Effectiveness</h2>
            <PromotionEffectivenessChart data={{
              labels: promotionData?.levelLabels || [],
              values: promotionData?.levelValues || []
            }} />
          </div>
          
          {/* Debug button only visible during development */}
          {process.env.NODE_ENV !== 'production' && (
            <button 
              onClick={() => console.log('Current data state:', {
                summary: summaryData,
                attendance: attendanceData,
                revenue: revenueData,
                promotion: promotionData
              })}
              style={{ 
                marginTop: '20px', 
                padding: '5px 10px',
                background: '#f0f0f0',
                border: '1px solid #ddd',
                cursor: 'pointer'
              }}
            >
              Debug Data
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminAnalytics;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAnalyticsSummary, 
  getAttendanceAnalytics, 
  getPromotionAnalytics,
  getEventsCreated
} from '../services/api';

// Import chart components
import EventPopularityChart from '../components/EventPopularityChart'; 
import AttendanceChart from '../components/AttendanceChart';
import PromotionEffectivenessChart from '../components/PromotionEffectivenessChart';
import CategoryDistributionChart from '../components/CategoryDistributionChart';

function AdminAnalytics({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('month'); // week, month, year
  const [summaryData, setSummaryData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [promotionData, setPromotionData] = useState(null);
  const [events, setEvents] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  
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
        
        // Get the 5 most recent events for our replacement component
        const sortedEvents = [...eventsData].sort((a, b) => 
          new Date(b.dateTime) - new Date(a.dateTime)
        ).slice(0, 5);
        setRecentEvents(sortedEvents);
        
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
      
      try {
        // Get data from API
        const summary = await getAnalyticsSummary(timeRange);
        const attendance = await getAttendanceAnalytics(timeRange);
        const promotion = await getPromotionAnalytics(timeRange);

        // Calculate total attendees directly from events data
        const totalAttendees = eventsData.reduce((sum, event) => sum + (event.attendees?.length || 0), 0);
        
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
        } else {
          setSummaryData({
            totalEvents: eventsData.length,
            totalAttendees: totalAttendees,
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
          setAttendanceData({
            labels: [],
            capacity: [],
            attendees: []
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
          setPromotionData({
            categoryLabels: [],
            categoryValues: [],
            levelLabels: [],
            levelValues: []
          });
        }
        
      } catch (apiError) {
        console.error('API error details:', apiError);
        setError(`API Error: ${apiError.message || 'Unknown error'}`);
        
        // No mock data - just show empty state
        setSummaryData({
          totalEvents: eventsData.length,
          totalAttendees: eventsData.reduce((sum, event) => sum + (event.attendees?.length || 0), 0),
          totalRevenue: 0,
          labels: [],
          eventData: [],
          registrationData: []
        });
        
        setAttendanceData({
          labels: [],
          capacity: [],
          attendees: []
        });
        
        setPromotionData({
          categoryLabels: [],
          categoryValues: [],
          levelLabels: [],
          levelValues: []
        });
      }
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };
  
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
          
          {/* NEW: Recent Events Table (replaces Revenue Breakdown) */}
          <div className="analytics-card">
            <h2>Recent Events</h2>
            {recentEvents.length > 0 ? (
              <div className="recent-events-table">
                <table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Date</th>
                      <th>Attendance</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEvents.map(event => (
                      <tr key={event._id}>
                        <td>{event.title}</td>
                        <td>{new Date(event.dateTime).toLocaleDateString()}</td>
                        <td>{event.attendees?.length || 0} / {event.capacity}</td>
                        <td>
                          {new Date(event.dateTime) > new Date() ? (
                            <span className="status upcoming">Upcoming</span>
                          ) : (
                            <span className="status completed">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data">No recent events found</div>
            )}
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
                events: recentEvents,
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

      {/* Add styles for the recent events table */}
      <style jsx>{`
        .recent-events-table {
          width: 100%;
          overflow-x: auto;
        }
        
        .recent-events-table table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .recent-events-table th, 
        .recent-events-table td {
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        .recent-events-table th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        
        .status {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .status.upcoming {
          background-color: #e3f2fd;
          color: #1976d2;
        }
        
        .status.completed {
          background-color: #e8f5e9;
          color: #388e3c;
        }
        
        .no-data {
          padding: 20px;
          text-align: center;
          color: #666;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

export default AdminAnalytics;
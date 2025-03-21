import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEvents, getPromotedEvents } from '../services/api';
import PromotionBadge from '../components/PromotionBadge';

function PromoterPanel({ user }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [promotedEvents, setPromotedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('available');

useEffect(() => {
  // Redirect if not promoter
  if (!user || user.role !== 'promoter') {
    navigate('/login');
    return;
  }

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const [allEvents, promotedEventsList] = await Promise.all([
        getEvents(),
        getPromotedEvents()
      ]);
      
      console.log('Promoted events:', promotedEventsList);
      
      // Filter out already promoted events
      const promotedIds = promotedEventsList.map(event => event._id);
      const availableEvents = allEvents.filter(
        event => !promotedIds.includes(event._id)
      );
      
      setEvents(availableEvents);
      setPromotedEvents(promotedEventsList);
    } catch (err) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  fetchEvents();
}, [user, navigate]);

  const handlePromoteEvent = (eventId, eventTitle) => {
    // Navigate to promotion options page instead of directly to payment
    navigate(`/promotion-options/${eventId}`);
  };

  if (loading) return <div className="loading">Loading promoter dashboard...</div>;

  return (
    <div className="promoter-panel">
      <div className="promoter-header">
        <h1>Promoter Dashboard</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="promoter-stats">
        <div className="stat-card">
          <div className="stat-value">{promotedEvents.length}</div>
          <div className="stat-label">Events Promoted</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{events.length}</div>
          <div className="stat-label">Available to Promote</div>
        </div>
      </div>

      <div className="promoter-tabs">
        <button 
          className={`tab-btn ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          Available Events
        </button>
        <button 
          className={`tab-btn ${activeTab === 'promoted' ? 'active' : ''}`}
          onClick={() => setActiveTab('promoted')}
        >
          My Promotions
        </button>
      </div>

      {activeTab === 'available' ? (
        <>
          <h2>Events Available for Promotion</h2>
          {events.length === 0 ? (
            <div className="no-events">
              <p>No events are available for promotion at this time.</p>
            </div>
          ) : (
            <div className="events-grid">
              {events.map(event => (
                <div key={event._id} className="event-card">
                  <div className="event-card-header">
                    <span className="event-category">{event.category}</span>
                    <h3 className="event-title">{event.title}</h3>
                  </div>
                  <div className="event-card-body">
                    <p className="event-date">
                      <i className="far fa-calendar"></i> 
                      {new Date(event.dateTime).toLocaleDateString()}
                    </p>
                    <p className="event-location">
                      <i className="fas fa-map-marker-alt"></i> {event.location}
                    </p>
                    <p className="event-attendees">
                      <i className="fas fa-users"></i> 
                      {event.attendees?.length || 0}/{event.capacity} registered
                    </p>
                    <div className="event-description-preview">
                      {event.description?.substring(0, 100)}
                      {event.description?.length > 100 ? '...' : ''}
                    </div>
                  </div>
                  <div className="event-card-footer">
                    <Link 
                      to={`/events/${event._id}`} 
                      className="view-details-btn"
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#4a90e2',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        marginRight: '10px',
                        display: 'inline-block'
                      }}
                    >
                      View Details
                    </Link>
                    <button 
                      className="promote-btn"
                      onClick={() => handlePromoteEvent(event._id, event.title)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#9c27b0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Promote Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <h2>Your Promoted Events</h2>
          {promotedEvents.length === 0 ? (
            <div className="no-events">
              <p>You haven't promoted any events yet.</p>
            </div>
          ) : (
            <div className="events-grid">
      {promotedEvents.map(event => (
       <div key={event._id} className="event-card promoted" style={{ position: 'relative' }}>
        <PromotionBadge level={event.promotionLevel} />
       <div className="event-card-header">
       <span className="event-category">{event.category}</span>
       <h3 className="event-title">{event.title}</h3>
       </div>
       <div className="event-card-body">
        <p className="event-date">
        <i className="far fa-calendar"></i> 
        {new Date(event.dateTime).toLocaleDateString()}
      </p>
      <p className="promotion-dates">
        <i className="fas fa-crown"></i> Promotion Until:
        {new Date(event.promotionExpiry).toLocaleDateString()}
      </p>
      <p className="event-location">
        <i className="fas fa-map-marker-alt"></i> {event.location}
      </p>
      <p className="event-attendees">
        <i className="fas fa-users"></i> 
        {event.attendees?.length || 0}/{event.capacity} registered
      </p>
    </div>
    <div className="event-card-footer">
      <Link 
        to={`/events/${event._id}`} 
        className="view-details-btn"
        style={{
          padding: '8px 16px',
          backgroundColor: '#4a90e2',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          display: 'inline-block'
        }}
      >
        View Event
      </Link>
    </div>
  </div>
))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PromoterPanel;
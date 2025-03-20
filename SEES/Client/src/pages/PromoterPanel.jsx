import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEvents, getPromotedEvents } from '../services/api';

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

    fetchEvents();
  }, [user, navigate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const [allEvents, userPromotedEvents] = await Promise.all([
        getEvents(),
        getPromotedEvents()
      ]);
      
      // Filter out already promoted events
      const promotedIds = userPromotedEvents.map(promo => promo.event._id);
      const availableEvents = allEvents.filter(
        event => !event.isPromoted && !promotedIds.includes(event._id)
      );
      
      setEvents(availableEvents);
      setPromotedEvents(userPromotedEvents);
    } catch (err) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteEvent = (eventId, eventTitle) => {
    navigate(`/payment/${eventId}?type=event_promotion`, {
      state: {
        amount: 25.00,
        promotionLevel: 'basic',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
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
                    <Link to={`/events/${event._id}`} className="view-details-btn">
                      View Details
                    </Link>
                    <button 
                      className="promote-btn"
                      onClick={() => handlePromoteEvent(event._id, event.title)}
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
              {promotedEvents.map(promotion => (
                <div key={promotion._id} className="event-card promoted">
                  <div className="event-card-header">
                    <span className="promotion-tag">{promotion.promotionLevel} Promotion</span>
                    <h3 className="event-title">{promotion.event.title}</h3>
                  </div>
                  <div className="event-card-body">
                    <p className="promotion-dates">
                      <i className="fas fa-calendar-check"></i> Promotion Period:
                    </p>
                    <p className="date-range">
                      {new Date(promotion.startDate).toLocaleDateString()} - 
                      {new Date(promotion.endDate).toLocaleDateString()}
                    </p>
                    <p className="promotion-status">
                      <i className="fas fa-info-circle"></i> Status: {promotion.status}
                    </p>
                  </div>
                  <div className="event-card-footer">
                    <Link to={`/events/${promotion.event._id}`} className="view-details-btn">
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
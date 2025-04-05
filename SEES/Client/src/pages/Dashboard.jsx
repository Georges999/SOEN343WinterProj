import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getEvents } from '../services/api'

function Dashboard({ user }) {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [filter, setFilter] = useState('all') // 'all', 'attending', 'organizing'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
    } else {
      fetchEvents()
    }
  }, [user, navigate])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const data = await getEvents()
      setEvents(data)
    } catch (err) {
      setError(err.message || 'Error fetching events')
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = () => {
    switch(filter) {
      case 'attending':
        return events.filter(event => 
          event.attendees?.some(attendee => attendee._id === user._id)
        )
      case 'organizing':
        return events.filter(event => event.organizer === user._id)
      default:
        return events
    }
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="user-welcome">
          <h1>Welcome, {user?.name || 'User'}!</h1>
          <p className="subtitle">View and manage your event registrations</p>
        </div>
        
        {/* Remove the Create Event button since only admins can create events */}
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value">{events.filter(e => e.organizer === user._id).length}</div>
          <div className="stat-label">Events Organized</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {events.filter(e => e.attendees?.some(a => a._id === user._id)).length}
          </div>
          <div className="stat-label">Events Attending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{events.length}</div>
          <div className="stat-label">Total Events</div>
        </div>
      </div>
      
      <div className="feature-promotion">
  <div className="promotion-card">
    <h3>Discover Events Just for You</h3>
    <p>Tell us about your skills and interests, and we'll recommend events that match your profile.</p>
    <Link to="/opportunity-hub" className="promo-button">
      <i className="fas fa-compass"></i> Explore Opportunity Hub
    </Link>
  </div>
</div>

      <div className="filter-controls">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Events
        </button>
        <button 
          className={`filter-btn ${filter === 'attending' ? 'active' : ''}`}
          onClick={() => setFilter('attending')}
        >
          Attending
        </button>
        <button 
          className={`filter-btn ${filter === 'organizing' ? 'active' : ''}`}
          onClick={() => setFilter('organizing')}
        >
          Organizing
        </button>
      </div>
      
      <section className="events-grid">
        {loading ? (
          <div className="loading">Loading events...</div>
        ) : filteredEvents().length > 0 ? (
          filteredEvents().map((event) => (
            <div className="event-card" key={event._id}>
              <div className="event-card-header" style={{
                backgroundColor: event.organizer === user._id ? '#e3f2fd' : '#fff'
              }}>
                {/* Add the promoted tag here */}
                {event.isPromoted && (
                  <span className="promoted-tag">Promoted</span>
                )}
                <span className="event-category">{event.category}</span>
                <h3 className="event-title">{event.title}</h3>
              </div>
              
              <div className="event-card-body">
                <p className="event-date">
                  <i className="far fa-calendar"></i> {formatDate(event.dateTime)}
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
                {/* Remove the edit button unless we want to keep it for admin users */}
                {event.organizer === user._id && user.role === 'admin' && (
                  <button className="edit-event-btn">
                    <i className="fas fa-edit"></i> Edit
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-events">
            <p>No events found</p>
            {/* Remove the create event link */}
            {user.role === 'admin' ? (
              <Link to="/create-event" className="create-event-link">
                Create your first event
              </Link>
            ) : (
              <p>Check back later for new events</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

export default Dashboard
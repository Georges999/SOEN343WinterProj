import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEventsCreated, deleteEvent } from '../services/api';

function AdminPanel({ user }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    // Redirect if not admin
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchEvents();
  }, [user, navigate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEventsCreated();
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (confirmDelete === eventId) {
      try {
        await deleteEvent(eventId);
        setEvents(events.filter(event => event._id !== eventId));
        setConfirmDelete(null);
      } catch (err) {
        setError(err.message || 'Failed to delete event');
      }
    } else {
      setConfirmDelete(eventId);
    }
  };

  if (loading) return <div className="loading">Loading admin dashboard...</div>;

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <Link to="/create-event" className="create-event-btn">Create New Event</Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-value">{events.length}</div>
          <div className="stat-label">Total Events Created</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {events.reduce((sum, event) => sum + (event.attendees?.length || 0), 0)}
          </div>
          <div className="stat-label">Total Attendees</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {events.filter(event => event.isPromoted).length}
          </div>
          <div className="stat-label">Promoted Events</div>
        </div>
      </div>

      <h2>Your Events</h2>
      
      {events.length === 0 ? (
        <div className="no-events">
          <p>You haven't created any events yet.</p>
          <Link to="/create-event">Create your first event</Link>
        </div>
      ) : (
        <div className="admin-events-table">
          <table>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Location</th>
                <th>Attendance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event._id}>
                  <td>{event.title}</td>
                  <td>{new Date(event.dateTime).toLocaleDateString()}</td>
                  <td>{event.location}</td>
                  <td>{event.attendees?.length || 0}/{event.capacity}</td>
                  <td>
                    {event.isPromoted ? (
                      <span className="tag promoted">Promoted</span>
                    ) : (
                      <span className="tag regular">Regular</span>
                    )}
                  </td>
                  <td className="actions">
                    <Link to={`/events/${event._id}`} className="view-btn" style={{ marginRight: '15px' }}>View</Link>
                    <Link to={`/edit-event/${event._id}`} className="edit-btn"  style={{ marginLeft: '15px' }}>Edit</Link>
                    <button 
                      className={`delete-btn ${confirmDelete === event._id ? 'confirm' : ''}`}
                      onClick={() => handleDeleteEvent(event._id)}
                    >
                      {confirmDelete === event._id ? 'Confirm?' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById,registerForEvent,cancelRegistration } from '../services/api';

function EventDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const eventData = await getEventById(id);
      setEvent(eventData);
      
      // Check if user is registered for this event
      if (user && eventData.attendees) {
        setIsRegistered(eventData.attendees.some(attendee => attendee._id === user._id));
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    //registeration logic
    try {
      setRegistrationLoading(true);
      await registerForEvent(id);
      
      // Refresh event details to update attendees list
      await fetchEventDetails();
      setIsRegistered(true);
    } catch (err) {
      setError(err.message || 'Failed to register for event');
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    try {
      setRegistrationLoading(true);
      await cancelRegistration(id);
      
      // Refresh event details to update attendees list
      await fetchEventDetails();
      setIsRegistered(false);
    } catch (err) {
      setError(err.message || 'Failed to cancel registration');
    } finally {
      setRegistrationLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading event details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!event) return <div className="not-found">Event not found</div>;

  return (
    <div className="event-details-page">
      <div className="event-header">
        <h1>{event.title}</h1>
        <div className="event-meta">
          <p className="event-date">
            {new Date(event.dateTime).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p className="event-time">
            {new Date(event.dateTime).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div className="event-body">
        <div className="event-main">
          <section className="event-description">
            <h2>About This Event</h2>
            <p>{event.description}</p>
          </section>

          <section className="event-details">
            <h2>Event Details</h2>
            <div className="detail-item">
              <strong>Location:</strong> {event.location}
            </div>
            <div className="detail-item">
              <strong>Category:</strong> {event.category}
            </div>
            <div className="detail-item">
              <strong>Capacity:</strong> {event.capacity} attendees
            </div>
            <div className="detail-item">
              <strong>Organizer:</strong> {event.organizer?.name || 'Unknown'}
            </div>
          </section>

          <section className="attendees-section">
            <h2>Attendees ({event.attendees?.length || 0})</h2>
            {event.attendees && event.attendees.length > 0 ? (
              <ul className="attendees-list">
                {event.attendees.map(attendee => (
                  <li key={attendee._id}>{attendee.name}</li>
                ))}
              </ul>
            ) : (
              <p>No attendees yet. Be the first to register!</p>
            )}
          </section>
        </div>

        <div className="event-sidebar">
          <div className="registration-card">
            <h3>Event Registration</h3>
            {isRegistered ? (
              <div className="registered-message">
                <p>You are registered for this event!</p>
                <button 
                  className="cancel-button" 
                  onClick={handleCancelRegistration}
                  disabled={registrationLoading}
                > {registrationLoading ? 'Processing...' : 'Cancel Registration'}
                </button>
              </div>
            ) : (
              <button 
                className="register-button" 
                onClick={handleRegister}
                disabled={event.attendees?.length >= event.capacity}
              >
                {registrationLoading ? 'Processing...' : 
                  event.attendees?.length >= event.capacity ? 'Event Full' : 'Register Now'}
              </button>
            )}
            <p className="spots-left">
              {Math.max(0, event.capacity - (event.attendees?.length || 0))} spots left
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
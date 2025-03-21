import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, registerForEvent, cancelRegistration } from '../services/api';
import PromotionBadge from '../components/PromotionBadge';

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

 // Update the fetchEventDetails function with better ID comparison

// Add this helper function to your EventDetails.jsx component

// Helper function to safely check if user is registered
const checkIfUserIsRegistered = (event, user) => {
  if (!user || !event?.attendees) return false;
  
  // Convert attendees to strings for safe comparison
  const attendeeIds = event.attendees.map(attendee => {
    // Handle both object format and string/ObjectId format
    if (typeof attendee === 'object' && attendee !== null) {
      return attendee._id || attendee.id || attendee.toString();
    }
    return attendee.toString();
  });
  
  // Check if user ID exists in the attendee IDs
  return attendeeIds.includes(user._id);
};

// Use this helper in fetchEventDetails
const fetchEventDetails = async () => {
  try {
    const eventData = await getEventById(id);
    setEvent(eventData);
    
    // Check if user is registered for this event using helper
    if (user) {
      const registered = checkIfUserIsRegistered(eventData, user);
      setIsRegistered(registered);
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
    
    // Redirect to payment page for paid events
    if (event.registrationFee > 0) {
      navigate(`/payment/event-registration/${id}`);
      return;
    }
    
    try {
      setRegistrationLoading(true);
      setError('');
      
      await registerForEvent(id);
      
      // Refresh event details
      await fetchEventDetails();
      setIsRegistered(true);
    } catch (err) {
      setError(err.message || 'Failed to register for event');
    } finally {
      setRegistrationLoading(false);
    }
  };
  // Update the handleCancelRegistration function

const handleCancelRegistration = async () => {
  try {
    setRegistrationLoading(true);
    setError('');
    
    console.log('Attempting to cancel registration for event:', id);
    
    try {
      await cancelRegistration(id);
      console.log('Cancellation API call succeeded');
      
      // Force refresh event data
      const updatedEvent = await getEventById(id);
      setEvent(updatedEvent);
      
      // Force set isRegistered to false - sometimes mongoose doesn't populate properly
      setIsRegistered(false);
      
      console.log('Registration cancelled successfully');
    } catch (err) {
      console.error('API error:', err);
      
      // If we get a "not registered" error but UI thinks we are registered,
      // force a refresh of the event data
      if (err.message === 'You are not registered for this event' && isRegistered) {
        console.log('Forcing refresh of event data');
        const updatedEvent = await getEventById(id);
        setEvent(updatedEvent);
        setIsRegistered(false);
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error('Registration cancellation error:', err);
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
            {event.registrationFee > 0 && (
              <div className="detail-item">
                <strong>Registration Fee:</strong> ${event.registrationFee.toFixed(2)}
              </div>
            )}
        {event.isPromoted && event.promotionLevel && (
         <div className="detail-item" style={{
        backgroundColor: event.promotionLevel === 'featured' ? '#f3e5f5' : 
                      event.promotionLevel === 'premium' ? '#e3f2fd' : 
                      '#e8f5e9',
          padding: '10px',
          borderRadius: '5px',
          marginTop: '10px'
         }}>
         <strong>Promotion Status:</strong> {' '}
         <span style={{ fontWeight: 'bold', 
           color: event.promotionLevel === 'featured' ? '#9c27b0' : 
                 event.promotionLevel === 'premium' ? '#2196f3' : 
               '#4caf50' 
         }}>
            {event.promotionLevel.charAt(0).toUpperCase() + event.promotionLevel.slice(1)}
         </span>
          {event.promotionExpiry && (
            <div style={{ marginTop: '5px', fontSize: '0.9em' }}>
             <strong>Promotion Until:</strong> {new Date(event.promotionExpiry).toLocaleDateString()}
           </div>
           )}
           </div>
           )}
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
                  event.attendees?.length >= event.capacity ? 'Event Full' : 
                  event.registrationFee > 0 ? `Register Now ($${event.registrationFee.toFixed(2)})` : 'Register Now'}
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
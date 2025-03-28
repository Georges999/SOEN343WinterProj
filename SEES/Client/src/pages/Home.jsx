import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEvents } from '../services/api';
import PromotionBadge from '../components/PromotionBadge';

function Home({ user }) {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect based on user role if logged in
    if (user) {
      switch(user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'promoter':
          navigate('/promoter/dashboard');
          break;
        case 'client':
          navigate('/dashboard');
          break;
        default:
          // If no valid role, do nothing and show home page
          break;
      }
    }

    const loadEvents = async () => {
      try {
        const events = await getEvents();
        // Show only 3 events as featured
        setFeaturedEvents(events.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
  }, [user, navigate]);

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Smart Education Events System</h1>
        <p>Discover, organize, and attend educational events with ease</p>
        
        {/* Only show CTA buttons for non-logged in users */}
        {!user && (
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary">Get Started</Link>
            <Link to="/login" className="btn btn-secondary">Sign In</Link>
          </div>
        )}
      </section>
      
      <section className="featured-events">
        <h2>Featured Events</h2>
        {error && <p className="error-message">{error}</p>}
        {loading ? (
          <p>Loading events...</p>
        ) : featuredEvents.length > 0 ? (
          <div className="events-grid">
            {featuredEvents.map(event => (
              <div key={event._id} className="event-card" style={{ position: 'relative' }}>
               <PromotionBadge level={event.promotionLevel} />
                <h3>{event.title}</h3>
                <p>{event.description.substring(0, 100)}...</p>
                <p>{new Date(event.dateTime).toLocaleDateString()}</p>
                <Link to={`/events/${event._id}`}>View Details</Link>
                {event.isPromoted && (
                  <span className="promoted-tag"></span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No events available at this time.</p>
        )}
      </section>
    </div>
  );
}

export default Home;
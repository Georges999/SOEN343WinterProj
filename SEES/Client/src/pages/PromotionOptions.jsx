import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '../services/api';

function PromotionOptions({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const promotionTiers = [
    {
      id: 'basic',
      name: 'Basic Promotion',
      price: 25,
      features: [
        'Event appears in search results',
        '7 days promotion period',
        'Standard visibility'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Promotion',
      price: 50,
      features: [
        'All Basic features',
        '14 days promotion period',
        'Featured on category pages',
        'Social media promotion'
      ]
    },
    {
      id: 'featured',
      name: 'Featured Promotion',
      price: 100,
      features: [
        'All Premium features',
        '30 days promotion period',
        'Featured on homepage',
        'Top of search results',
        'Email newsletter inclusion'
      ]
    }
  ];

  useEffect(() => {
    // Redirect if not promoter
    if (!user || user.role !== 'promoter') {
      navigate('/login');
      return;
    }

    const fetchEvent = async () => {
      try {
        const eventData = await getEventById(id);
        setEvent(eventData);
      } catch (err) {
        setError(err.message || 'Failed to fetch event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user, navigate]);

  const handleSelectTier = (tier) => {
    navigate(`/payment/event-promotion/${id}`, { 
      state: { 
        promotionLevel: tier.id,
        amount: tier.price
      }
    });
  };

  if (loading) return <div className="loading">Loading event details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!event) return <div className="not-found">Event not found</div>;


return (
  <div className="promotion-options-page">
    <div className="promotion-options-header">
      <h1>Choose Promotion Package</h1>
    </div>
    
    <div className="event-preview">
      <h2>Event: {event.title}</h2>
      <p><strong>Date:</strong> {new Date(event.dateTime).toLocaleDateString()}</p>
      <p><strong>Location:</strong> {event.location}</p>
    </div>
    
    <div className="promotion-tiers">
      {promotionTiers.map(tier => (
        <div key={tier.id} className={`promotion-card ${tier.id}`}>
          <h3>{tier.name}</h3>
          <div className={`price ${tier.id}`}>${tier.price}</div>
          <ul className="features-list">
            {tier.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
          <button 
            onClick={() => handleSelectTier(tier)}
            className="select-tier-btn"
          >
            Select {tier.name}
          </button>
        </div>
      ))}
    </div>
    
    <button 
      onClick={() => navigate('/promoter/dashboard')}
      className="back-button"
    >
      Back to Dashboard
    </button>
  </div>
);
}

export default PromotionOptions;
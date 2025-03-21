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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Choose Promotion Package</h1>
      
      <div style={{ marginBottom: '30px', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
        <h2 style={{ marginBottom: '10px', fontSize: '20px' }}>Event: {event.title}</h2>
        <p style={{ marginBottom: '5px' }}>
          <strong>Date:</strong> {new Date(event.dateTime).toLocaleDateString()}
        </p>
        <p style={{ marginBottom: '5px' }}>
          <strong>Location:</strong> {event.location}
        </p>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {promotionTiers.map(tier => (
          <div key={tier.id} style={{ 
            flex: 1,
            minWidth: '250px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fff',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ 
              textAlign: 'center',
              marginBottom: '10px',
              color: tier.id === 'featured' ? '#9c27b0' : tier.id === 'premium' ? '#2196f3' : '#4caf50'
            }}>
              {tier.name}
            </h3>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '28px', fontWeight: 'bold' }}>${tier.price}</span>
            </div>
            
            <ul style={{ marginBottom: '20px', flexGrow: 1, paddingLeft: '20px' }}>
              {tier.features.map((feature, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>{feature}</li>
              ))}
            </ul>
            
            <button 
              onClick={() => handleSelectTier(tier)}
              style={{
                padding: '10px 0',
                backgroundColor: tier.id === 'featured' ? '#9c27b0' : tier.id === 'premium' ? '#2196f3' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              Select {tier.name}
            </button>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button 
          onClick={() => navigate('/promoter/dashboard')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f5f5f5',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default PromotionOptions;
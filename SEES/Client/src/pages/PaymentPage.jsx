import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getEventById, registerForEvent, processPayment } from '../services/api';
import PaymentForm from '../components/PaymentForm';

function PaymentPage({ user }) {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [promotionDetails, setPromotionDetails] = useState({
    level: 'basic',
    duration: 7
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        if (type === 'event-registration') {
          const eventData = await getEventById(id);
          setEvent(eventData);
          
          // Check if user is already registered
          if (eventData.attendees?.some(attendee => attendee._id === user._id)) {
            navigate(`/events/${id}`);
            return;
          }
          
          // Set payment amount from registration fee
          setPaymentAmount(eventData.registrationFee || 10);
        } else if (type === 'event-promotion') {
          const eventData = await getEventById(id);
          setEvent(eventData);
          
          // Set promotion details from location state
          if (location.state?.promotionLevel) {
            const level = location.state.promotionLevel;
            setPromotionDetails({
              level,
              duration: level === 'featured' ? 30 : level === 'premium' ? 14 : 7
            });
            
            // Use the amount from state or default based on level
            setPaymentAmount(location.state.amount || 
              (level === 'featured' ? 100 : level === 'premium' ? 50 : 25));
          } else {
            // Default to basic promotion if no state passed
            setPaymentAmount(25);
          }
        } else {
          throw new Error('Invalid payment type');
        }
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [type, id, user, navigate, location.state]);

// Update the handlePaymentSubmit function in PaymentPage.jsx

const handlePaymentSubmit = async (paymentDetails) => {
  try {
    setSubmitting(true);
    setError('');
    
    // Simulate payment processing with a timeout
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (type === 'event-registration') {
      // Register the user for the event
      await registerForEvent(id);
      
      setPaymentSuccess(true);
      setTimeout(() => navigate(`/events/${id}`), 2000);
    } 
    else if (type === 'event-promotion') {
      // For promotion, make an actual API call to update the event
      console.log(`Processing ${promotionDetails.level} promotion for event ${id}`);
      
      // Call processPayment API with the correct paymentMethod value
      await processPayment(`/payments/event-promotion/${id}`, {
        paymentMethod: 'credit_card', // Changed from 'credit' to 'credit_card'
        cardDetails: {
          cardholderName: paymentDetails.cardholderName,
          cardNumber: paymentDetails.cardNumber,
          expiryDate: paymentDetails.expiryDate,
          cvv: paymentDetails.cvv
        },
        promotionLevel: promotionDetails.level,
        amount: paymentAmount
      });
      
      setPaymentSuccess(true);
      setTimeout(() => navigate('/promoter/dashboard'), 2000);
    }
  } catch (err) {
    setError(err.message || 'Payment processing failed');
  } finally {
    setSubmitting(false);
  }
};

  if (loading) return <div className="loading">Loading payment details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!event) return <div className="not-found">Event not found</div>;

  return (
    <div className="payment-page" style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div className="payment-container">
        <div className="payment-header" style={{ marginBottom: '20px' }}>
          <h1 style={{ color: '#333' }}>Complete Your Payment</h1>
        </div>
        
        {paymentSuccess ? (
          <div className="payment-success" style={{
            padding: '20px',
            backgroundColor: '#e8f5e9',
            borderRadius: '5px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#2e7d32' }}>Payment Successful!</h2>
            <p>Your payment has been processed successfully.</p>
            <p>Redirecting you back...</p>
          </div>
        ) : (
          <>
            <div className="event-summary" style={{ 
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#fff',
              borderRadius: '5px',
              border: '1px solid #eee'
            }}>
              <h2 style={{ marginBottom: '10px', fontSize: '18px' }}>Summary</h2>
              <div className="event-info">
                <p><strong>Event:</strong> {event.title}</p>
                <p><strong>Date:</strong> {new Date(event.dateTime).toLocaleDateString()}</p>
                <p><strong>Location:</strong> {event.location}</p>
                
                {type === 'event-promotion' && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <p><strong>Promotion Package:</strong> {promotionDetails.level.charAt(0).toUpperCase() + promotionDetails.level.slice(1)}</p>
                    <p><strong>Duration:</strong> {promotionDetails.duration} days</p>
                  </div>
                )}
                
                <p style={{ 
                  marginTop: '15px', 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: '#4CAF50'
                }}>
                  <strong>Total Amount:</strong> ${paymentAmount.toFixed(2)}
                </p>
              </div>
            </div>
            
            <PaymentForm 
              onSubmit={handlePaymentSubmit} 
              amount={paymentAmount} 
              paymentType={type}
              submitting={submitting}
            />
            
            <div className="payment-actions" style={{ marginTop: '20px', textAlign: 'center' }}>
              <button 
                className="cancel-payment" 
                onClick={() => navigate(type === 'event-promotion' ? '/promoter/dashboard' : `/events/${id}`)}
                disabled={submitting}
                style={{ 
                  backgroundColor: '#f44336', 
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentPage;
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
      console.log(`Processing ${promotionDetails.level} promotion for event ${id}`);
      
      // Call processPayment API with the correct paymentMethod value
      await processPayment(`/payments/event-promotion/${id}`, {
        paymentMethod: 'credit_card', 
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
  <div className="payment-page">
    <div className="payment-container">
      <div className="payment-header">
        <h1>Complete Your Payment</h1>
      </div>
      
      {paymentSuccess ? (
        <div className="payment-success">
          <h2>Payment Successful!</h2>
          <p>Your payment has been processed successfully.</p>
          <p>Redirecting you back...</p>
        </div>
      ) : (
        <>
          <div className="event-summary">
            <h2>Summary</h2>
            <div className="event-info">
              <p><strong>Event:</strong> {event.title}</p>
              <p><strong>Date:</strong> {new Date(event.dateTime).toLocaleDateString()}</p>
              <p><strong>Location:</strong> {event.location}</p>
              
              {type === 'event-promotion' && (
                <div className="promotion-package">
                  <p><strong>Promotion Package:</strong> {promotionDetails.level.charAt(0).toUpperCase() + promotionDetails.level.slice(1)}</p>
                  <p><strong>Duration:</strong> {promotionDetails.duration} days</p>
                </div>
              )}
              
              <div className="total-amount">
                <strong>Total Amount:</strong> ${paymentAmount.toFixed(2)}
              </div>
            </div>
          </div>
          
          <div className="payment-form">
            <PaymentForm 
              onSubmit={handlePaymentSubmit} 
              amount={paymentAmount} 
              paymentType={type}
              submitting={submitting}
            />
          </div>
          
          <div className="payment-actions">
            <button 
              className="cancel-payment" 
              onClick={() => navigate(type === 'event-promotion' ? '/promoter/dashboard' : `/events/${id}`)}
              disabled={submitting}
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
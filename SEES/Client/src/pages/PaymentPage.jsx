import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, registerForEvent } from '../services/api';
import PaymentForm from '../components/PaymentForm';

function PaymentPage({ user }) {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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
          setPaymentAmount(25); // Default promotion amount
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
  }, [type, id, user, navigate]);

  const handlePaymentSubmit = async (paymentDetails) => {
    try {
      setSubmitting(true);
      setError('');
      
      // For demo purposes, we'll simulate a successful payment
      // In a real app, you would call your payment API here

      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (type === 'event-registration') {
        // Register the user for the event
        await registerForEvent(id);
        
        setPaymentSuccess(true);
        
        // Show success for 2 seconds before redirecting
        setTimeout(() => {
          navigate(`/events/${id}`);
        }, 2000);
      } else if (type === 'event-promotion') {
        // In a real app, call your promotion API here
        setPaymentSuccess(true);
        
        // Show success for 2 seconds before redirecting
        setTimeout(() => {
          navigate(`/events/${id}`);
        }, 2000);
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
            <p>Redirecting you back to the event...</p>
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
              <h2 style={{ marginBottom: '10px', fontSize: '18px' }}>Event Details</h2>
              <div className="event-info">
                <p><strong>Event:</strong> {event.title}</p>
                <p><strong>Date:</strong> {new Date(event.dateTime).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {new Date(event.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Amount:</strong> ${paymentAmount.toFixed(2)}</p>
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
                onClick={() => navigate(`/events/${id}`)}
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
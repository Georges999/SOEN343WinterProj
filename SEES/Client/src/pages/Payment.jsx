import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PaymentForm from '../components/PaymentForm';
import { processPayment } from '../services/api';

function Payment({ user }) {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Get payment type and amount from URL params or state
  const paymentType = new URLSearchParams(location.search).get('type') || 'event_registration';
  const amount = location.state?.amount || (paymentType === 'event_registration' ? 15.00 : 25.00);
  
  // Redirect if user isn't logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handlePaymentSubmit = async (paymentDetails) => {
    setLoading(true);
    setError('');
    
    try {
      // Call the appropriate API endpoint based on payment type
      const endpoint = paymentType === 'event_registration' 
        ? `/payments/event-registration/${eventId}`
        : `/payments/event-promotion/${eventId}`;
      
      // Include promotion details if this is a promotion payment
      const additionalData = paymentType === 'event_promotion' 
        ? { 
            promotionLevel: location.state?.promotionLevel || 'basic',
            endDate: location.state?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          } 
        : {};
      
      await processPayment(endpoint, {
        ...paymentDetails,
        ...additionalData
      });
      
      setSuccess(true);
      
      // Redirect after successful payment
      setTimeout(() => {
        navigate(paymentType === 'event_registration' 
          ? `/events/${eventId}` 
          : '/promoter/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Processing payment...</div>;
  
  return (
    <div className="payment-page">
      <div className="payment-container">
        {success ? (
          <div className="success-message">
            <h2>Payment Successful!</h2>
            <p>Your payment has been processed successfully.</p>
            <p>You will be redirected shortly...</p>
          </div>
        ) : (
          <>
            <h1>Complete Your Payment</h1>
            {error && <div className="error-message">{error}</div>}
            
            <PaymentForm 
              onSubmit={handlePaymentSubmit} 
              amount={amount} 
              paymentType={paymentType} 
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Payment;
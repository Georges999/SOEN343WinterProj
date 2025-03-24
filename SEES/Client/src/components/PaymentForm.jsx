import { useState } from 'react';

function PaymentForm({ onSubmit, amount, paymentType, submitting }) {
  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'credit'
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <div className="payment-form-container" style={{ 
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '5px',
      border: '1px solid #eee' 
    }}>
      <h2 style={{ marginBottom: '15px', fontSize: '18px' }}>Payment Details</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label 
            htmlFor="paymentMethod" 
            style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}
          >
            Payment Method
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            required
            style={{ 
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="credit">Credit Card</option>
            <option value="debit">Debit Card</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label 
            htmlFor="cardholderName" 
            style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}
          >
            Cardholder Name
          </label>
          <input
            type="text"
            id="cardholderName"
            name="cardholderName"
            value={formData.cardholderName}
            onChange={handleChange}
            required
            style={{ 
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label 
            htmlFor="cardNumber" 
            style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}
          >
            Card Number
          </label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            placeholder="1234 5678 9012 3456"
            required
            style={{ 
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label 
              htmlFor="expiryDate" 
              style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}
            >
              Expiry Date
            </label>
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              placeholder="MM/YY"
              required
              style={{ 
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <label 
              htmlFor="cvv" 
              style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}
            >
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              value={formData.cvv}
              onChange={handleChange}
              placeholder="123"
              required
              style={{ 
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <button
            type="submit"
            disabled={submitting}
            style={{ 
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              width: '100%',
              fontSize: '16px',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PaymentForm;
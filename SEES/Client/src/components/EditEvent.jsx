import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, updateEvent } from '../services/api';

function EditEvent({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    location: '',
    category: 'workshop',
    capacity: 10,
    isPublic: true
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Update the useEffect function with better organizer check

useEffect(() => {
    // Redirect if not admin
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
  
    const fetchEvent = async () => {
      try {
        console.log("Fetching event with ID:", id);
        const eventData = await getEventById(id);
        console.log("Event data received:", eventData);
        
        // For admin users, skip the organizer check
        if (user.role === 'admin') {
          console.log("Admin user - skipping organizer check");
          
          // Format date for the input field
          const dateObj = new Date(eventData.dateTime);
          const formattedDate = dateObj.toISOString().slice(0, 16);
          
          setFormData({
            title: eventData.title || '',
            description: eventData.description || '',
            dateTime: formattedDate,
            location: eventData.location || '',
            category: eventData.category || 'workshop',
            capacity: eventData.capacity || 10,
            isPublic: eventData.isPublic !== undefined ? eventData.isPublic : true
          });
          
          setLoading(false);
          return;
        }
        
        // For non-admin users, check if they are the organizer
        const organizerId = typeof eventData.organizer === 'object' 
          ? eventData.organizer._id
          : eventData.organizer;
        
        console.log("Organizer ID:", organizerId);
        console.log("User ID:", user._id);
        
        if (organizerId !== user._id) {
          setError('You can only edit events you have created');
          setLoading(false);
          return;
        }
        
        // Format date for the input field
        const dateObj = new Date(eventData.dateTime);
        const formattedDate = dateObj.toISOString().slice(0, 16);
        
        setFormData({
          title: eventData.title || '',
          description: eventData.description || '',
          dateTime: formattedDate,
          location: eventData.location || '',
          category: eventData.category || 'workshop',
          capacity: eventData.capacity || 10,
          isPublic: eventData.isPublic !== undefined ? eventData.isPublic : true
        });
        
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(err.message || 'Failed to fetch event details');
      } finally {
        setLoading(false);
      }
    };
  
    fetchEvent();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      console.log("Submitting update for event ID:", id);
      console.log("Form data:", formData);
      
      const result = await updateEvent(id, formData);
      console.log("Update successful:", result);
      
      navigate(`/events/${id}`);
    } catch (err) {
      console.error("Error updating event:", err);
      setError(err.message || 'Failed to update event');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading event details...</div>;
  
  // CSS styles for buttons
  const buttonStyles = {
    container: {
      marginTop: '20px',
      display: 'flex',
      gap: '10px'
    },
    cancelButton: {
      backgroundColor: '#f44336',
      color: 'white',
      padding: '10px 15px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold'
    },
    submitButton: {
      backgroundColor: '#4CAF50',
      color: 'white',
      padding: '10px 15px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold'
    },
    disabledButton: {
      backgroundColor: '#cccccc',
      color: '#666666',
      padding: '10px 15px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'not-allowed',
      fontWeight: 'bold'
    }
  };
  
  return (
    <div className="edit-event-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>Edit Event</h1>
      
      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#d32f2f', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Event Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '16px'
            }}
          ></textarea>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="dateTime" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Date and Time
            </label>
            <input
              type="datetime-local"
              id="dateTime"
              name="dateTime"
              value={formData.dateTime}
              onChange={handleChange}
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <label htmlFor="location" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="category" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                fontSize: '16px'
              }}
            >
              <option value="workshop">Workshop</option>
              <option value="lecture">Lecture</option>
              <option value="seminar">Seminar</option>
              <option value="conference">Conference</option>
              <option value="networking">Networking</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div style={{ flex: 1 }}>
            <label htmlFor="capacity" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Capacity
            </label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              min="1"
              value={formData.capacity}
              onChange={handleChange}
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              style={{ marginRight: '8px' }}
            />
            Make this event public
          </label>
        </div>
        
        <div style={buttonStyles.container}>
          <button 
            type="button" 
            style={buttonStyles.cancelButton}
            onClick={() => navigate('/admin/dashboard')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            style={submitting ? buttonStyles.disabledButton : buttonStyles.submitButton}
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Event'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditEvent;
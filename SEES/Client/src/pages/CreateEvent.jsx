import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../services/api';

function CreateEvent({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'workshop',
    capacity: 50,
    isPublic: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Format date and time for API
      const eventData = {
        ...formData,
        organizer: user._id,
        dateTime: new Date(`${formData.date}T${formData.time}`)
      };

      await createEvent(eventData, user.token);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-page">
      <h1>Create New Event</h1>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Event Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Event Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="5"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Time</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="workshop">Workshop</option>
            <option value="lecture">Lecture</option>
            <option value="seminar">Seminar</option>
            <option value="conference">Conference</option>
            <option value="networking">Networking Event</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="capacity">Capacity</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            min="1"
            value={formData.capacity}
            onChange={handleChange}
            required
          />
        </div>

<div className="form-group">
  <label htmlFor="registrationFee">Registration Fee ($)</label>
  <input
    type="number"
    id="registrationFee"
    name="registrationFee"
    min="0"
    step="0.01"
    value={formData.registrationFee}
    onChange={handleChange}
  />
</div>

        <div className="form-group checkbox">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
          />
          <label htmlFor="isPublic">Public Event</label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating Event...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}

export default CreateEvent;
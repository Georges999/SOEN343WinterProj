const API_URL = 'http://localhost:5000/api';

// Auth services
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Event services
export const getEvents = async () => {
  try {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await fetch(`${API_URL}/events`, { headers });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch events');
    }
    
    return data;
  } catch (error) {
    console.error('Get events error:', error);
    throw error;
  }
};

export const getEventById = async (eventId) => {
  try {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await fetch(`${API_URL}/events/${eventId}`, { headers });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch event');
    }
    
    return data;
  } catch (error) {
    console.error('Get event by ID error:', error);
    throw error;
  }
};

export const createEvent = async (eventData) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.token) {
      throw new Error('You must be logged in to create an event');
    }
    
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify(eventData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create event');
    }
    
    return data;
  } catch (error) {
    console.error('Create event error:', error);
    throw error;
  }
};

export const registerForEvent = async (eventId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.token) {
      throw new Error('You must be logged in to register for an event');
    }
    
    const response = await fetch(`${API_URL}/events/${eventId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to register for event');
    }
    
    return data;
  } catch (error) {
    console.error('Register for event error:', error);
    throw error;
  }
};

// Updated cancelRegistration function

export const cancelRegistration = async (eventId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.token) {
      throw new Error('You must be logged in to cancel registration');
    }
    
    console.log(`Sending cancellation request for event ${eventId}`);
    console.log(`User ID: ${user._id}`);
    
    const response = await fetch(`${API_URL}/events/${eventId}/register`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      }
    });
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error('Response is not valid JSON', e);
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    
    if (!response.ok) {
      console.error('Cancel registration failed:', data);
      throw new Error(data.message || 'Failed to cancel registration');
    }
    
    console.log('Cancel registration succeeded:', data);
    return data;
  } catch (error) {
    console.error('Cancel registration error:', error);
    throw error;
  }
};
// Process a payment
export const processPayment = async (endpoint, paymentDetails) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.token) {
      throw new Error('You must be logged in to make a payment');
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify(paymentDetails)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Payment processing failed');
    }
    
    return data;
  } catch (error) {
    console.error('Process payment error:', error);
    throw error;
  }
};

// Get events created by admin
export const getEventsCreated = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.token) {
      throw new Error('Not authorized');
    }
    
    const response = await fetch(`${API_URL}/admin/events`, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch created events');
    }
    
    return data;
  } catch (error) {
    console.error('Get events created error:', error);
    throw error;
  }
};

// Delete an event (admin only)
export const deleteEvent = async (eventId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.token) {
      throw new Error('Not authorized');
    }
    
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete event');
    }
    
    return data;
  } catch (error) {
    console.error('Delete event error:', error);
    throw error;
  }
};

// Get events promoted by this promoter
export const getPromotedEvents = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.token) {
      throw new Error('You must be logged in to view promoted events');
    }
    
    const response = await fetch(`${API_URL}/events/promoted`, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    });
    
    if (!response.ok) {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        throw new Error(data.message || `Server error: ${response.status}`);
      } catch (e) {
        throw new Error(`Server error: ${response.status} - ${text.substring(0, 100)}`);
      }
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get promoted events error:', error);
    // Return empty array instead of throwing to avoid breaking the UI
    return [];
  }
};

// Update an event
export const updateEvent = async (eventId, eventData) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.token) {
      throw new Error('You must be logged in to update an event');
    }
    
    // Fixed URL path - removed the duplicate '/api'
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify(eventData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update event');
    }
    
    return data;
  } catch (error) {
    console.error('Update event error:', error);
    throw error;
  }
};

export const removeAttendee = async (eventId, attendeeId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.token) {
      throw new Error('You must be logged in to remove attendees');
    }
    
    const response = await fetch(`${API_URL}/events/${eventId}/attendees/${attendeeId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to remove attendee');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Remove attendee error:', error);
    throw error;
  }
};

//for analytics
export const getAnalyticsSummary = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.token) {
      throw new Error('You must be logged in to access analytics');
    }
    
    const response = await fetch(`${API_URL}/admin/analytics/summary`, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch analytics data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    throw error;
  }
};

export const getAttendanceAnalytics = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.token) {
      throw new Error('You must be logged in to access analytics');
    }
    
    const response = await fetch(`${API_URL}/admin/analytics/attendance`, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch attendance data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching attendance analytics:', error);
    throw error;
  }
};

export const getRevenueAnalytics = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.token) {
      throw new Error('You must be logged in to access revenue data');
    }
    
    const response = await fetch(`${API_URL}/admin/analytics/revenue`, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch revenue data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    throw error;
  }
};

export const getPromotionAnalytics = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.token) {
      throw new Error('You must be logged in to access promotion data');
    }
    
    const response = await fetch(`${API_URL}/admin/analytics/promotions`, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch promotion data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching promotion analytics:', error);
    throw error;
  }
};
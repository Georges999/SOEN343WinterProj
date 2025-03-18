const API_URL = 'http://localhost:5000/api';

// Auth services
export const registerUser = async (userData) => {
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
};

export const loginUser = async (credentials) => {
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
};

// Event services
export const getEvents = async () => {
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
  const response = await fetch(`${API_URL}/events`, { headers });
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch events');
  }
  
  return data;
};

export const getEventById = async (eventId) => {
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
  const response = await fetch(`${API_URL}/events/${eventId}`, { headers });
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch event');
  }
  
  return data;
};

export const createEvent = async (eventData) => {
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
};

export const registerForEvent = async (eventId) => {
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
};

export const cancelRegistration = async (eventId) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user || !user.token) {
    throw new Error('You must be logged in to cancel registration');
  }
  
  const response = await fetch(`${API_URL}/events/${eventId}/register`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to cancel registration');
  }
  
  return data;
};
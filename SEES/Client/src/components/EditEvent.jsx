import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, updateEvent, removeAttendee } from '../services/api';

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
    isPublic: true,
    registrationFee: 0
  });
  const [attendees, setAttendees] = useState([]);
  const [seatingLayout, setSeatingLayout] = useState({
    rows: 5,
    columns: 10,
    seatMap: {}
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [selectedAttendee, setSelectedAttendee] = useState(null);

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
            isPublic: eventData.isPublic !== undefined ? eventData.isPublic : true,
            registrationFee: eventData.registrationFee || 0
          });
          
          // Set attendees
          setAttendees(eventData.attendees || []);
          
          // Initialize seat map if it exists, otherwise create default
          if (eventData.seatingLayout) {
            console.log("Using existing seating layout:", eventData.seatingLayout);
            setSeatingLayout(eventData.seatingLayout);
          } else {
            // Create default seat map based on capacity
            // Find an efficient rectangle for the capacity
            const rows = Math.ceil(Math.sqrt(eventData.capacity));
            const columns = Math.ceil(eventData.capacity / rows);
            
            console.log("Creating default seating layout:", { rows, columns, capacity: eventData.capacity });
            setSeatingLayout({
              rows,
              columns,
              seatMap: {},
              capacity: eventData.capacity // Store capacity to limit available seats
            });
          }
          
          setLoading(false);
          return;
        }
        
        // For non-admin users (should not reach here due to earlier check)
        navigate('/login');
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
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    });
  };

  const handleRemoveAttendee = async (attendeeId) => {
    try {
      if (!window.confirm('Are you sure you want to remove this attendee?')) {
        return;
      }
      
      await removeAttendee(id, attendeeId);
      
      // Update the local state to reflect the change
      setAttendees(attendees.filter(attendee => attendee._id !== attendeeId));
      
      // Remove from seat map if assigned
      const updatedSeatMap = { ...seatingLayout.seatMap };
      for (const seatKey in updatedSeatMap) {
        if (updatedSeatMap[seatKey] === attendeeId) {
          delete updatedSeatMap[seatKey];
        }
      }
      setSeatingLayout({
        ...seatingLayout,
        seatMap: updatedSeatMap
      });
    } catch (err) {
      setError(err.message || 'Failed to remove attendee');
    }
  };

  const handleSeatingLayoutChange = (e) => {
    const { name, value } = e.target;
    const numberValue = parseInt(value, 10);
    
    if (numberValue > 0) {
      setSeatingLayout(prev => ({
        ...prev,
        [name]: numberValue
      }));
    }
  };

  const handleSeatClick = (rowIndex, colIndex) => {
    const seatKey = `${rowIndex}-${colIndex}`;
    
    if (!selectedAttendee) {
      // If no attendee is selected, show who is assigned to this seat
      const attendeeId = seatingLayout.seatMap[seatKey];
      if (attendeeId) {
        const attendee = attendees.find(a => a._id === attendeeId);
        alert(`This seat is assigned to ${attendee?.name || 'Unknown Attendee'}`);
      }
      return;
    }
    
    // If an attendee is selected, assign them to this seat
    const updatedSeatMap = { ...seatingLayout.seatMap };
    
    // First remove attendee from any existing seat
    for (const key in updatedSeatMap) {
      if (updatedSeatMap[key] === selectedAttendee._id) {
        delete updatedSeatMap[key];
      }
    }
    
    // Then assign to the new seat
    updatedSeatMap[seatKey] = selectedAttendee._id;
    
    const updatedSeatingLayout = {
      ...seatingLayout,
      seatMap: updatedSeatMap
    };
    
    setSeatingLayout(updatedSeatingLayout);
    console.log("Updated seating layout:", updatedSeatingLayout);
    
    // Clear selected attendee
    setSelectedAttendee(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      console.log("Submitting update for event ID:", id);
      
      // Combine all data for the update
      const updatedEventData = {
        ...formData,
        // Include seating layout with proper structure to ensure it's saved
        seatingLayout: {
          rows: seatingLayout.rows,
          columns: seatingLayout.columns,
          seatMap: seatingLayout.seatMap
        }
      };
      
      console.log("Form data:", updatedEventData);
      
      const result = await updateEvent(id, updatedEventData);
      console.log("Update successful:", result);
      
      navigate(`/events/${id}`);
    } catch (err) {
      console.error("Error updating event:", err);
      setError(err.message || 'Failed to update event');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading event details...</div>;
  
  // CSS styles for components
  const styles = {
    container: {
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: '20px'
    },
    header: {
      color: '#333', 
      marginBottom: '20px'
    },
    error: {
      backgroundColor: '#ffebee', 
      color: '#d32f2f', 
      padding: '10px', 
      borderRadius: '4px', 
      marginBottom: '20px'
    },
    tabContainer: {
      display: 'flex',
      borderBottom: '1px solid #ddd',
      marginBottom: '20px'
    },
    tab: {
      padding: '10px 20px',
      cursor: 'pointer',
      borderBottom: '2px solid transparent'
    },
    activeTab: {
      borderBottom: '2px solid #2196f3',
      fontWeight: 'bold',
      color: '#2196f3'
    },
    formRow: {
      marginBottom: '15px'
    },
    formGroup: {
      display: 'flex', 
      gap: '15px', 
      marginBottom: '15px'
    },
    formControl: {
      width: '100%', 
      padding: '8px', 
      border: '1px solid #ddd', 
      borderRadius: '4px',
      fontSize: '16px'
    },
    label: {
      display: 'block', 
      marginBottom: '5px', 
      fontWeight: 'bold'
    },
    attendeeCard: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      marginBottom: '10px'
    },
    selectedAttendeeCard: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px',
      border: '2px solid #2196f3',
      borderRadius: '4px',
      marginBottom: '10px',
      backgroundColor: '#e3f2fd'
    },
    seatingGrid: {
      display: 'grid',
      gridTemplateColumns: `repeat(${seatingLayout.columns}, 40px)`,
      gap: '5px',
      margin: '20px 0'
    },
    seat: {
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #ddd',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    emptySeat: {
      backgroundColor: '#f5f5f5'
    },
    occupiedSeat: {
      backgroundColor: '#e3f2fd',
      color: '#2196f3',
      fontWeight: 'bold'
    },
    buttonContainer: {
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
    <div className="edit-event-page" style={styles.container}>
      <h1 style={styles.header}>Edit Event</h1>
      
      {error && <div style={styles.error}>{error}</div>}
      
      <div style={styles.tabContainer}>
        <div 
          style={{ 
            ...styles.tab, 
            ...(activeTab === 'details' ? styles.activeTab : {}) 
          }}
          onClick={() => setActiveTab('details')}
        >
          Event Details
        </div>
        <div 
          style={{ 
            ...styles.tab, 
            ...(activeTab === 'attendees' ? styles.activeTab : {}) 
          }}
          onClick={() => setActiveTab('attendees')}
        >
          Manage Attendees ({attendees.length})
        </div>
        <div 
          style={{ 
            ...styles.tab, 
            ...(activeTab === 'seating' ? styles.activeTab : {}) 
          }}
          onClick={() => setActiveTab('seating')}
        >
          Seating Arrangement
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {activeTab === 'details' && (
          <div className="event-details-form">
            <div style={styles.formRow}>
              <label htmlFor="title" style={styles.label}>
                Event Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                style={styles.formControl}
              />
            </div>
            
            <div style={styles.formRow}>
              <label htmlFor="description" style={styles.label}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                required
                style={styles.formControl}
              ></textarea>
            </div>
            
            <div style={styles.formGroup}>
              <div style={{ flex: 1 }}>
                <label htmlFor="dateTime" style={styles.label}>
                  Date and Time
                </label>
                <input
                  type="datetime-local"
                  id="dateTime"
                  name="dateTime"
                  value={formData.dateTime}
                  onChange={handleChange}
                  required
                  style={styles.formControl}
                />
              </div>
              
              <div style={{ flex: 1 }}>
                <label htmlFor="location" style={styles.label}>
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  style={styles.formControl}
                />
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <div style={{ flex: 1 }}>
                <label htmlFor="category" style={styles.label}>
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={styles.formControl}
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
                <label htmlFor="capacity" style={styles.label}>
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
                  style={styles.formControl}
                />
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <div style={{ flex: 1 }}>
                <label htmlFor="registrationFee" style={styles.label}>
                  Registration Fee ($)
                </label>
                <input
                  type="number"
                  id="registrationFee"
                  name="registrationFee"
                  min="0"
                  step="0.01"
                  value={formData.registrationFee}
                  onChange={handleChange}
                  style={styles.formControl}
                />
              </div>
              
              <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: '8px' }}>
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
            </div>
          </div>
        )}
        
        {activeTab === 'attendees' && (
          <div className="attendees-management">
            <h2>Manage Attendees</h2>
            <p>Select an attendee to assign them to a seat or remove them from the event.</p>
            
            {attendees.length === 0 ? (
              <div>No attendees registered for this event yet.</div>
            ) : (
              <div style={{ marginTop: '20px' }}>
                {attendees.map(attendee => (
                  <div 
                    key={attendee._id} 
                    style={selectedAttendee?._id === attendee._id ? styles.selectedAttendeeCard : styles.attendeeCard}
                    onClick={() => setSelectedAttendee(attendee === selectedAttendee ? null : attendee)}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{attendee.name}</div>
                      <div style={{ fontSize: '0.9em', color: '#666' }}>{attendee.email}</div>
                    </div>
                    <div>
                      <button
                        type="button"
                        style={{
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '5px 10px',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAttendee(attendee._id);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'seating' && (
          <div className="seating-arrangement">
            <h2>Seating Arrangement</h2>
            <p>
              {selectedAttendee ? (
                <span>Click on a seat to assign <strong>{selectedAttendee.name}</strong> or <button 
                  type="button" 
                  onClick={() => setSelectedAttendee(null)}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#2196f3',
                    border: 'none',
                    padding: '0',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >cancel selection</button></span>
              ) : (
                <span>Select an attendee from the Attendees tab to assign them a seat</span>
              )}
            </p>
            
            <div style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
              <div>
                <label htmlFor="rows" style={styles.label}>Rows:</label>
                <input 
                  type="number" 
                  id="rows" 
                  name="rows"
                  min="1"
                  value={seatingLayout.rows}
                  onChange={handleSeatingLayoutChange}
                  style={{ width: '60px', padding: '5px' }}
                />
              </div>
              <div>
                <label htmlFor="columns" style={styles.label}>Columns:</label>
                <input 
                  type="number" 
                  id="columns" 
                  name="columns"
                  min="1"
                  value={seatingLayout.columns}
                  onChange={handleSeatingLayoutChange}
                  style={{ width: '60px', padding: '5px' }}
                />
              </div>
            </div>
            
            <div style={styles.seatingGrid}>
  {Array.from({ length: seatingLayout.rows }).map((_, rowIndex) => (
    Array.from({ length: seatingLayout.columns }).map((_, colIndex) => {
      const seatKey = `${rowIndex}-${colIndex}`;
      const seatNumber = rowIndex * seatingLayout.columns + colIndex + 1;
      const isValidSeat = seatNumber <= formData.capacity;
      const attendeeId = seatingLayout.seatMap[seatKey];
      const attendee = attendees.find(a => a._id === attendeeId);
      
             return (
                   <div 
                       key={seatKey}
                      style={{
                     ...styles.seat,
                     ...(attendeeId ? styles.occupiedSeat : styles.emptySeat),
                     ...(isValidSeat ? {} : {
                    backgroundColor: '#e0e0e0',
                    color: '#9e9e9e',
                   cursor: 'not-allowed',
                   opacity: 0.5
                     })
                  }}
               onClick={() => isValidSeat && handleSeatClick(rowIndex, colIndex)}
                  title={!isValidSeat ? 'Seat not available' : 
                       attendee ? attendee.name : 'Empty Seat'}
                     >
                       {attendee ? attendee.name.charAt(0) : 
                       isValidSeat ? (rowIndex+1) + '-' + (colIndex+1) : 'X'}
                        </div>
                       );
                    })
                 ))}
              </div>
            
              <div style={{ marginTop: '20px' }}>
                 <h3>Seat Legend</h3>
                   <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                     <div style={{ display: 'flex', alignItems: 'center', margin: '5px 0' }}>
                      <div style={{ ...styles.seat, ...styles.emptySeat, marginRight: '10px' }}>1-1</div>
                      <span>Empty Seat</span>
               </div>
                    <div style={{ display: 'flex', alignItems: 'center', margin: '5px 0' }}>
                      <div style={{ ...styles.seat, ...styles.occupiedSeat, marginRight: '10px' }}>J</div>
                       <span>Occupied (first letter of attendee's name)</span>
              </div>
                  <div style={{ display: 'flex', alignItems: 'center', margin: '5px 0' }}>
                    <div style={{ 
                      ...styles.seat, 
                      backgroundColor: '#e0e0e0',
                     color: '#9e9e9e',
                     opacity: 0.5,
                      marginRight: '10px' 
          }}>X</div>
                <span>Unavailable (exceeds capacity)</span>
               </div>
          </div>
        </div>
          </div>
        )}
        
        <div style={styles.buttonContainer}>
          <button 
            type="button" 
            style={styles.cancelButton}
            onClick={() => navigate('/admin/dashboard')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            style={submitting ? styles.disabledButton : styles.submitButton}
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
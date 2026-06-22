import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SlotVisualizer from '../../components/SlotVisualizer';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingParams, setBookingParams] = useState({
    vehicleType: 'two-wheeler',
    startTime: '',
    endTime: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSlots();
    // Pre-fill dates for better UX
    // Adjust for Local Timezone offset so HTML datetime-local pre-fills correctly
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
    const localNow = new Date(now.getTime() - tzOffset);
    const localLater = new Date(localNow.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    setBookingParams(prev => ({
      ...prev,
      startTime: localNow.toISOString().slice(0, 16),
      endTime: localLater.toISOString().slice(0, 16)
    }));
  }, []);

  const fetchSlots = async () => {
    try {
      const { data } = await api.get('/slots');
      setSlots(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load parking slots.');
      setLoading(false);
    }
  };

  const handleBookSlot = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!selectedSlot) {
      setError('Please select an available parking slot first.');
      return;
    }

    try {
      // Ensure we convert the local datetime string back into an absolute Date object
      // so we send a universal ISO string to the backend, avoiding timezone parsing misalignments!
      const absoluteStartTime = new Date(bookingParams.startTime).toISOString();
      const absoluteEndTime = new Date(bookingParams.endTime).toISOString();

      const { data } = await api.post('/bookings', {
        slotId: selectedSlot._id,
        vehicleType: bookingParams.vehicleType,
        startTime: absoluteStartTime,
        endTime: absoluteEndTime
      });
      
      setMessage(`Slot ${selectedSlot.slotNumber} allocation requested successfully! Awaiting manager approval...`);
      setSelectedSlot(null);
      fetchSlots(); // Refresh slots

      // Simulate a small delay before redirecting to bookings history
      setTimeout(() => {
        navigate('/my-bookings');
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed.');
    }
  };

  if (loading) return <div className="loader">Loading slots...</div>;

  if (user?.role === 'manager') {
    return (
      <div className="dashboard-container fade-in" style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>Manager Restricted</h2>
        <p className="text-muted mt-4">Managers are not permitted to make direct slot bookings.</p>
        <button onClick={() => navigate('/manager')} className="btn btn-primary mt-4">Go to Manager Panel</button>
      </div>
    );
  }

  let previewPrice = 0;
  let basePrice = 0;
  if (bookingParams.startTime && bookingParams.endTime && selectedSlot) {
    const hours = Math.ceil(Math.abs(new Date(bookingParams.endTime) - new Date(bookingParams.startTime)) / 36e5) || 1;
    
    if (selectedSlot.type === 'premium') {
      basePrice = bookingParams.vehicleType === 'two-wheeler' ? 150 : 200;
    } else {
      basePrice = bookingParams.vehicleType === 'two-wheeler' ? 100 : 150;
    }
    
    previewPrice = basePrice + (hours > 1 ? (hours - 1) * 50 : 0);
  }

  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-header glass-panel">
        <div>
          <h2>Real-Time Parking Dashboard</h2>
          <p className="text-muted">Select an available slot below to start your booking.</p>
        </div>
        <button onClick={fetchSlots} className="btn btn-outline">Refresh Map</button>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {message && <div className="alert-success">{message}</div>}

      <div className="dashboard-content">
        <div className="slot-container glass-panel">
          <SlotVisualizer 
            slots={slots} 
            onSlotSelect={setSelectedSlot} 
            selectedSlot={selectedSlot} 
          />
        </div>

        <div className="booking-panel glass-panel">
          <h3>Booking Details</h3>
          {selectedSlot ? (
            <form onSubmit={handleBookSlot} className="booking-form">
              <div className="selected-info">
                <h4>Slot {selectedSlot.slotNumber}</h4>
                <span className={`badge ${selectedSlot.type}`}>{selectedSlot.type}</span>
              </div>
              
              <div className="form-group">
                <label>Vehicle Type</label>
                <select 
                  className="input-field"
                  value={bookingParams.vehicleType}
                  onChange={(e) => setBookingParams({...bookingParams, vehicleType: e.target.value})}
                  required
                >
                  <option value="two-wheeler">Two Wheeler</option>
                  <option value="four-wheeler">Four Wheeler</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Arrival Time</label>
                <input 
                  type="datetime-local" 
                  className="input-field"
                  value={bookingParams.startTime}
                  onChange={(e) => setBookingParams({...bookingParams, startTime: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Departure Time</label>
                <input 
                  type="datetime-local" 
                  className="input-field"
                  value={bookingParams.endTime}
                  onChange={(e) => setBookingParams({...bookingParams, endTime: e.target.value})}
                  required 
                />
              </div>

              <div className="price-estimation">
                <span>Total Estimated Cost: ₹{previewPrice}</span>
                <div style={{fontSize: '0.75rem', fontWeight: 'normal', marginTop: '4px', opacity: 0.8}}>Based on {selectedSlot.type === 'premium' ? (bookingParams.vehicleType === 'two-wheeler' ? '₹150' : '₹200') : (bookingParams.vehicleType === 'two-wheeler' ? '₹100' : '₹150')} base + ₹50/extra hr</div>
              </div>

              <button type="submit" className="btn btn-primary w-100 mt-4">Request Slot Allocation</button>
            </form>
          ) : (
            <div className="empty-selection">
              <span className="visual-icon">🚗</span>
              <p>Click on an available green slot to see details and proceed with booking.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

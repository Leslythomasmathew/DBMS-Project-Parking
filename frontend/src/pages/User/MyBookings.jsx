import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activePaymentId, setActivePaymentId] = useState(null);
  const [paymentMode, setPaymentMode] = useState('card');
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings/mybookings');
      setBookings(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch bookings');
      setLoading(false);
    }
  };

  const openPaymentModal = (id) => {
    setActivePaymentId(id);
    setPaymentMode('card');
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    try {
      await api.put(`/bookings/${activePaymentId}/pay`, { paymentMode });
      setShowPaymentModal(false);
      setSuccessMessage(`Payment via ${paymentMode.toUpperCase()} processed successfully!`);
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.put(`/bookings/${id}/cancel`);
        fetchBookings();
      } catch (err) {
        alert('Failed to cancel booking');
      }
    }
  };

  if (loading) return <div className="loader">Loading your bookings...</div>;

  return (
    <>
    <div className="bookings-container fade-in">
      <div className="dashboard-header glass-panel">
        <h2>My Bookings</h2>
      </div>

      {error && <div className="alert-error mt-4">{error}</div>}
      {successMessage && <div className="alert-success mt-4">{successMessage}</div>}

      <div className="bookings-list mt-4">
        {bookings.length === 0 ? (
          <div className="glass-panel empty-state">
            <p>You have no bookings yet.</p>
          </div>
        ) : (
          bookings.map(booking => (
            <div key={booking._id} className="booking-card glass-panel">
              <div className="booking-header">
                <div>
                  <h3>Slot {booking.slot?.slotNumber || 'N/A'}</h3>
                  <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                </div>
                <div className="booking-amount">
                  ₹{booking.totalAmount.toFixed(2)}
                </div>
              </div>
              
              <div className="booking-details">
                <div className="detail-group">
                  <span className="label">Vehicle:</span>
                  <span style={{textTransform:'capitalize'}}>{booking.vehicleType?.replace('-', ' ')}</span>
                </div>
                <div className="detail-group">
                  <span className="label">Arrival:</span>
                  <span>{new Date(booking.startTime).toLocaleString()}</span>
                </div>
                <div className="detail-group">
                  <span className="label">Departure:</span>
                  <span>{new Date(booking.endTime).toLocaleString()}</span>
                </div>
                <div className="detail-group">
                  <span className="label">Payment Status:</span>
                  <span className={`pay-status ${booking.paymentStatus}`}>{booking.paymentStatus}</span>
                </div>
              </div>

              <div className="booking-actions">
                {(booking.status === 'active' || booking.status === 'pending' || booking.status === 'allocated') && (
                  <button onClick={() => handleCancel(booking._id)} className="btn btn-danger btn-sm">
                    Cancel Request
                  </button>
                )}
                {booking.paymentStatus === 'pending' && booking.status === 'allocated' && (
                  <button onClick={() => openPaymentModal(booking._id)} className="btn btn-success btn-sm">
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
      
      {showPaymentModal && (
        <div className="payment-modal-overlay fade-in">
          <div className="payment-modal glass-panel">
            <h3>Select Payment Method</h3>
            <p className="text-muted mb-4">Choose how you would like to complete your transaction today.</p>
            
            <div className="payment-options">
              <div 
                className={`payment-card ${paymentMode === 'card' ? 'selected' : ''}`}
                onClick={() => setPaymentMode('card')}
              >
                Credit / Debit Card
              </div>
              <div 
                className={`payment-card ${paymentMode === 'upi' ? 'selected' : ''}`}
                onClick={() => setPaymentMode('upi')}
              >
                UPI
              </div>
              <div 
                className={`payment-card ${paymentMode === 'cash' ? 'selected' : ''}`}
                onClick={() => setPaymentMode('cash')}
              >
                Cash
              </div>
            </div>

            <div className="modal-actions mt-4">
              <button className="btn btn-danger" onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button className="btn btn-success" onClick={handlePaymentSubmit}>Confirm Payment</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyBookings;

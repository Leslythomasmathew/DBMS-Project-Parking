import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    usersCount: 0,
    slotsCount: 0
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newSlotNumber, setNewSlotNumber] = useState('');
  const [newSlotType, setNewSlotType] = useState('regular');
  const [createMessage, setCreateMessage] = useState(null);
  const [createError, setCreateError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [{ data: statsData }, { data: bookingsData }] = await Promise.all([
        api.get('/manager/stats'),
        api.get('/manager/bookings')
      ]);
      setStats(statsData);
      setBookings(bookingsData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/manager/bookings/${id}/approve`);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this request?')) {
      try {
        await api.put(`/manager/bookings/${id}/reject`);
        fetchDashboardData();
      } catch (err) {
        alert(err.response?.data?.message || 'Rejection failed');
      }
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setCreateMessage(null);
    setCreateError(null);
    
    if (!newSlotNumber.trim()) {
      setCreateError('Slot number cannot be empty.');
      return;
    }

    try {
      await api.post('/manager/slots', {
        slotNumber: newSlotNumber.trim(),
        type: newSlotType,
        pricePerHour: newSlotType === 'premium' ? 20 : 10
      });
      setCreateMessage(`Success! Slot ${newSlotNumber} has been added to the facility.`);
      setNewSlotNumber('');
      fetchDashboardData();
      
      setTimeout(() => setCreateMessage(null), 5000);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create slot.');
    }
  };

  if (loading) return <div className="loader">Loading Analytics...</div>;

  return (
    <div className="manager-dashboard fade-in">
      <div className="dashboard-header glass-panel">
        <h2>Manager Overview</h2>
      </div>

      <div className="stats-grid mt-4">
        <div className="stat-card glass-panel">
          <div className="stat-title">Total Bookings</div>
          <div className="stat-value text-primary">{stats.totalBookings}</div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-title">Active Bookings</div>
          <div className="stat-value text-success">{stats.activeBookings}</div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-title">Registered Users</div>
          <div className="stat-value text-warning">{stats.usersCount}</div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-title">Managed Slots</div>
          <div className="stat-value text-secondary">{stats.slotsCount}</div>
        </div>
      </div>

      <div className="slot-creation glass-panel mt-4">
        <h3>Facility Setup: Add New Parking Slot</h3>
        <p className="text-muted mb-4">Input a unique identifier to expand the physical parking map.</p>
        
        {createError && <div className="alert-error" style={{marginBottom: '1rem'}}>{createError}</div>}
        {createMessage && <div className="alert-success" style={{marginBottom: '1rem'}}>{createMessage}</div>}

        <form onSubmit={handleCreateSlot} className="slot-form">
          <div className="form-group mb-0">
            <input 
              type="text" 
              className="input-field" 
              placeholder="Slot ID (e.g. C-14)" 
              value={newSlotNumber}
              onChange={(e) => setNewSlotNumber(e.target.value)}
            />
          </div>
          <div className="form-group mb-0">
            <select 
              className="input-field"
              value={newSlotType}
              onChange={(e) => setNewSlotType(e.target.value)}
            >
              <option value="regular">Regular Zone</option>
              <option value="premium">Premium Zone</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Inject Slot</button>
        </form>
      </div>

      <div className="recent-activity glass-panel mt-4">
        <h3>System Bookings Timeline</h3>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>User</th>
                <th>Slot</th>
                <th>Vehicle</th>
                <th>Amount</th>
                <th>Timing</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id}>
                  <td className="text-muted">...{b._id.slice(-6)}</td>
                  <td>{b.user?.name || 'Deleted User'}</td>
                  <td><span className={`badge ${b.slot?.type || 'regular'}`}>{b.slot?.slotNumber || 'Deleted'}</span></td>
                  <td style={{textTransform:'capitalize'}}>{b.vehicleType?.replace('-', ' ')}</td>
                  <td className="font-bold">₹{b.totalAmount}</td>
                  <td>
                    <div className="timing-cell">
                      <span>In: {new Date(b.startTime).toLocaleString()}</span>
                      <span>Out: {new Date(b.endTime).toLocaleString()}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${b.status}`}>{b.status}</span>
                  </td>
                  <td>
                    <span className={`pay-status ${b.paymentStatus}`}>{b.paymentStatus}</span>
                  </td>
                  <td>
                    {b.status === 'pending' && (
                      <div className="action-buttons">
                        <button onClick={() => handleApprove(b._id)} className="btn btn-success btn-sm me-2">Approve</button>
                        <button onClick={() => handleReject(b._id)} className="btn btn-danger btn-sm">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center p-4">No bookings found in the system.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;

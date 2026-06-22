import React from 'react';
import './SlotVisualizer.css';

const SlotVisualizer = ({ slots, onSlotSelect, selectedSlot }) => {
  return (
    <div className="slot-visualizer">
      <div className="legend">
        <div className="legend-item"><span className="swatch available"></span> Available</div>
        <div className="legend-item"><span className="swatch reserved"></span> Reserved/Pending</div>
        <div className="legend-item"><span className="swatch occupied"></span> Occupied</div>
        <div className="legend-item"><span className="swatch maintenance"></span> Maintenance</div>
        <div className="legend-item"><span className="swatch selected"></span> Selected</div>
      </div>
      
      <div className="slot-grid">
        {slots.map(slot => (
          <div 
            key={slot._id}
            className={`slot-card ${slot.status} ${slot.type} ${selectedSlot?._id === slot._id ? 'selected' : ''}`}
            onClick={() => slot.status === 'available' ? onSlotSelect(slot) : null}
          >
            <div className="slot-info">
              <h3>{slot.slotNumber}</h3>
              <span className={`badge ${slot.type}`}>{slot.type}</span>
            </div>

            {slot.status === 'occupied' && <div className="overlay-text">Occupied</div>}
            {slot.status === 'maintenance' && <div className="overlay-text">Maintenance</div>}
            {slot.status === 'reserved' && <div className="overlay-text">Pending</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlotVisualizer;

import React, { useState } from 'react';
import { X, Moon, Clock } from 'lucide-react';
import { storage } from '../../utils/storage';

export const SleepModal = ({ isOpen, onClose }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState('Good'); // 'Great' | 'Good' | 'Fair' | 'Poor'

  if (!isOpen) return null;

  // Calculate duration in hours
  const calculateDuration = () => {
    try {
      const [bH, bM] = bedtime.split(':').map(Number);
      const [wH, wM] = wakeTime.split(':').map(Number);

      let bedDate = new Date();
      bedDate.setHours(bH, bM, 0, 0);

      let wakeDate = new Date();
      wakeDate.setHours(wH, wM, 0, 0);

      if (wakeDate <= bedDate) {
        wakeDate.setDate(wakeDate.getDate() + 1);
      }

      const diffMs = wakeDate - bedDate;
      const hours = diffMs / (1000 * 60 * 60);
      return hours.toFixed(1);
    } catch (e) {
      return 8;
    }
  };

  const durationHours = calculateDuration();

  const handleSubmit = (e) => {
    e.preventDefault();
    storage.addSleepRecord({
      date,
      bedtime,
      wakeTime,
      durationHours: parseFloat(durationHours),
      quality
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="title-with-icon">
            <Moon size={20} className="text-indigo" />
            <h3 className="modal-title font-heading">Log Sleep Record</h3>
          </div>
          <button className="btn-icon mini-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form-body">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Bedtime</label>
              <input
                type="time"
                className="form-input"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                required
              />
            </div>

            <div className="form-group flex-1">
              <label>Wake-up Time</label>
              <input
                type="time"
                className="form-input"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group duration-box">
            <span className="duration-lbl">Calculated Sleep Duration:</span>
            <span className="duration-val font-heading">{durationHours} Hours</span>
          </div>

          <div className="form-group">
            <label>Sleep Quality</label>
            <div className="quality-chips-row">
              {['Great', 'Good', 'Fair', 'Poor'].map((q) => (
                <button
                  type="button"
                  key={q}
                  className={`quality-chip ${quality === q ? 'selected' : ''}`}
                  onClick={() => setQuality(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary modal-submit-btn">
            Log Sleep
          </button>
        </form>
      </div>

      <style>{`
        .duration-box {
          background: var(--bg-surface-elevated);
          padding: 0.85rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .duration-lbl { font-size: 0.8rem; color: var(--text-muted); }
        .duration-val { font-size: 1.15rem; font-weight: 800; color: var(--accent-primary); }
        .quality-chips-row { display: flex; gap: 0.5rem; }
        .quality-chip {
          flex: 1;
          padding: 0.5rem;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 600;
        }
        .quality-chip.selected {
          background: var(--grad-primary);
          color: #fff;
          border-color: transparent;
        }
      `}</style>
    </div>
  );
};

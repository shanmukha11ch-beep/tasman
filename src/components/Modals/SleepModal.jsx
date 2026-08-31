import React, { useState } from 'react';
import { X, Moon, Clock } from 'lucide-react';
import { storage } from '../../utils/storage';
import { calculateSleepDuration, evaluateSleepQuality, getSleepQualityLabel } from '../../utils/sleepUtils';

export const SleepModal = ({ isOpen, onClose }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [manualQuality, setManualQuality] = useState(null);

  if (!isOpen) return null;

  const durationHours = calculateSleepDuration(bedtime, wakeTime);
  const autoQuality = evaluateSleepQuality(durationHours);
  const quality = manualQuality || autoQuality;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !bedtime || !wakeTime) return;

    storage.addSleepRecord({
      date,
      bedtime,
      wakeTime,
      durationHours,
      quality
    });
    setManualQuality(null);
    onClose();
  };

  const handleBedtimeChange = (val) => {
    setBedtime(val);
    setManualQuality(null); // Recalculate auto quality when time changes
  };

  const handleWakeTimeChange = (val) => {
    setWakeTime(val);
    setManualQuality(null); // Recalculate auto quality when time changes
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
                onChange={(e) => handleBedtimeChange(e.target.value)}
                required
              />
            </div>

            <div className="form-group flex-1">
              <label>Wake-up Time</label>
              <input
                type="time"
                className="form-input"
                value={wakeTime}
                onChange={(e) => handleWakeTimeChange(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group duration-box">
            <span className="duration-lbl">Calculated Duration:</span>
            <span className="duration-val font-heading">
              {durationHours} Hours — {getSleepQualityLabel(quality)}
            </span>
          </div>

          <div className="form-group">
            <label>Sleep Quality (Auto-Evaluated)</label>
            <div className="quality-chips-row">
              {['Good', 'Average', 'Poor', 'Oversleep'].map((q) => (
                <button
                  type="button"
                  key={q}
                  className={`quality-chip ${quality === q ? 'selected' : ''}`}
                  onClick={() => setManualQuality(q)}
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
        .duration-val { font-size: 0.95rem; font-weight: 800; color: var(--accent-primary); }
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

import React, { useState, useEffect } from 'react';
import {
  X,
  Flame,
  Heart,
  Target,
  Book,
  Dumbbell,
  Droplet,
  Sun,
  Coffee,
  Zap,
  Shield,
  Smile,
  Code,
  Repeat,
  Bell,
  Calendar,
  Award
} from 'lucide-react';
import { storage } from '../../utils/storage';

const AVAILABLE_ICONS = [
  { name: 'Flame', component: Flame },
  { name: 'Heart', component: Heart },
  { name: 'Target', component: Target },
  { name: 'Book', component: Book },
  { name: 'Dumbbell', component: Dumbbell },
  { name: 'Droplet', component: Droplet },
  { name: 'Sun', component: Sun },
  { name: 'Coffee', component: Coffee },
  { name: 'Zap', component: Zap },
  { name: 'Shield', component: Shield },
  { name: 'Smile', component: Smile },
  { name: 'Code', component: Code }
];

const COLOR_OPTIONS = [
  '#f59e0b', // Amber
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#f43f5e'  // Rose
];

export const HabitModal = ({ isOpen, onClose, initialHabit = null }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Health');
  const [icon, setIcon] = useState('Flame');
  const [color, setColor] = useState('#f59e0b');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Repeat
  const [repeatFreq, setRepeatFreq] = useState('daily');
  const [weekdays, setWeekdays] = useState([]);
  const [customDays, setCustomDays] = useState(1);

  // Reminder
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');

  // Goal
  const [goalTarget, setGoalTarget] = useState(1);
  const [goalUnit, setGoalUnit] = useState('times');

  // Status
  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title || '');
      setCategory(initialHabit.category || 'Health');
      setIcon(initialHabit.icon || 'Flame');
      setColor(initialHabit.color || '#f59e0b');
      setStartDate(initialHabit.startDate || new Date().toISOString().split('T')[0]);
      setStatus(initialHabit.status || 'active');

      if (initialHabit.repeat) {
        setRepeatFreq(initialHabit.repeat.frequency || 'daily');
        setWeekdays(initialHabit.repeat.weekdays || []);
        setCustomDays(initialHabit.repeat.customDays || 1);
      }
      if (initialHabit.reminder) {
        setReminderEnabled(initialHabit.reminder.enabled || false);
        setReminderTime(initialHabit.reminder.time || '08:00');
      }
      if (initialHabit.goal) {
        setGoalTarget(initialHabit.goal.target || 1);
        setGoalUnit(initialHabit.goal.unit || 'times');
      }
    } else {
      setTitle('');
      setCategory('Health');
      setIcon('Flame');
      setColor('#f59e0b');
      setStartDate(new Date().toISOString().split('T')[0]);
      setRepeatFreq('daily');
      setWeekdays([]);
      setCustomDays(1);
      setReminderEnabled(false);
      setReminderTime('08:00');
      setGoalTarget(1);
      setGoalUnit('times');
      setStatus('active');
    }
  }, [initialHabit, isOpen]);

  if (!isOpen) return null;

  const toggleWeekday = (dayNum) => {
    if (weekdays.includes(dayNum)) {
      setWeekdays(weekdays.filter((d) => d !== dayNum));
    } else {
      setWeekdays([...weekdays, dayNum].sort());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const habitPayload = {
      title: title.trim(),
      category,
      icon,
      color,
      startDate,
      status,
      repeat: {
        frequency: repeatFreq,
        weekdays,
        customDays
      },
      reminder: {
        enabled: reminderEnabled,
        time: reminderTime
      },
      goal: {
        target: parseInt(goalTarget, 10) || 1,
        unit: goalUnit || 'times'
      }
    };

    if (initialHabit) {
      storage.updateHabit(initialHabit.id, habitPayload);
    } else {
      storage.addHabit(habitPayload);
    }

    onClose();
  };

  const categories = ['Health', 'Fitness', 'Productivity', 'Learning', 'Mindfulness', 'Finance', 'General'];
  const weekdayNames = [
    { num: 1, label: 'Mon' },
    { num: 2, label: 'Tue' },
    { num: 3, label: 'Wed' },
    { num: 4, label: 'Thu' },
    { num: 5, label: 'Fri' },
    { num: 6, label: 'Sat' },
    { num: 0, label: 'Sun' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <h3 className="modal-title font-heading">
            {initialHabit ? 'Edit Habit' : 'Create Habit'}
          </h3>
          <button className="btn-icon mini-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="habit-form-body">
          {/* Name */}
          <div className="form-group">
            <label>Habit Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Drink 2L Water, Read 20 pages"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Category & Status */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {initialHabit && (
              <div className="form-group flex-1">
                <label>Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            )}
          </div>

          {/* Icon Selector */}
          <div className="form-group">
            <label>Icon</label>
            <div className="icon-grid">
              {AVAILABLE_ICONS.map((item) => {
                const IconComp = item.component;
                const isSelected = icon === item.name;
                return (
                  <button
                    type="button"
                    key={item.name}
                    className={`icon-choice-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => setIcon(item.name)}
                    style={isSelected ? { borderColor: color, color: color } : {}}
                  >
                    <IconComp size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div className="form-group">
            <label>Color Accent</label>
            <div className="color-chips-row">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`color-chip ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {/* Repeat Schedule */}
          <div className="form-group repeat-group-box">
            <label className="label-with-icon">
              <Repeat size={14} /> Repeat Schedule
            </label>
            <select
              className="form-select"
              value={repeatFreq}
              onChange={(e) => setRepeatFreq(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom Interval</option>
            </select>

            {repeatFreq === 'weekly' && (
              <div className="weekdays-selector">
                <span className="sublabel">Repeat on weekdays:</span>
                <div className="weekdays-chips font-heading">
                  {weekdayNames.map((w) => {
                    const isSelected = weekdays.includes(w.num);
                    return (
                      <button
                        type="button"
                        key={w.num}
                        className={`day-chip ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleWeekday(w.num)}
                      >
                        {w.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {repeatFreq === 'custom' && (
              <div className="custom-days-input">
                <span className="sublabel">Repeat every (days):</span>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="365"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Goal & Start Date */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Daily Goal</label>
              <div className="goal-input-row">
                <input
                  type="number"
                  className="form-input flex-1"
                  min="1"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input flex-1"
                  placeholder="times, mins, km"
                  value={goalUnit}
                  onChange={(e) => setGoalUnit(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group flex-1">
              <label>Start Date</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          {/* Reminder Toggle */}
          <div className="form-group reminder-box">
            <div className="reminder-header-row">
              <label className="label-with-icon">
                <Bell size={14} /> Reminder Notification
              </label>
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
              />
            </div>
            {reminderEnabled && (
              <input
                type="time"
                className="form-input mt-2"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
            )}
          </div>

          <button type="submit" className="btn-primary modal-submit-btn">
            {initialHabit ? 'Save Changes' : 'Create Habit'}
          </button>
        </form>
      </div>

      <style>{`
        .modal-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .modal-title { font-size: 1.15rem; font-weight: 700; }
        .habit-form-body { display: flex; flex-direction: column; gap: 0.85rem; }
        .form-row { display: flex; gap: 0.75rem; }
        .flex-1 { flex: 1; }
        .icon-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 0.5rem;
          margin-top: 0.25rem;
        }
        .icon-choice-btn {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          color: var(--text-muted);
          cursor: pointer;
        }
        .icon-choice-btn.selected {
          border-width: 2px;
          background: rgba(255, 255, 255, 0.08);
        }
        .color-chips-row {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }
        .color-chip {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
        }
        .color-chip.selected {
          border-color: #fff;
          transform: scale(1.15);
        }
        .repeat-group-box, .reminder-box {
          background: var(--bg-surface-elevated);
          padding: 0.85rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }
        .label-with-icon { display: flex; align-items: center; gap: 0.4rem; color: var(--accent-primary); font-weight: 600; }
        .weekdays-selector { display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; }
        .sublabel { font-size: 0.75rem; color: var(--text-muted); }
        .weekdays-chips { display: flex; gap: 0.35rem; }
        .day-chip {
          flex: 1;
          padding: 0.4rem 0.2rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
        }
        .day-chip.selected {
          background: var(--grad-primary);
          color: #fff;
          border-color: transparent;
        }
        .goal-input-row { display: flex; gap: 0.5rem; }
        .reminder-header-row { display: flex; align-items: center; justify-content: space-between; }
        .mt-2 { margin-top: 0.5rem; }
        .modal-submit-btn { width: 100%; padding: 0.85rem; margin-top: 0.5rem; }
      `}</style>
    </div>
  );
};

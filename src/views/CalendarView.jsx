import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Circle,
  Calendar as CalendarIcon,
  Clock,
  Repeat
} from 'lucide-react';
import { storage } from '../utils/storage';
import { EmptyState } from '../components/EmptyState';

export const CalendarView = ({ state, onOpenTaskModal }) => {
  const [viewMode, setViewMode] = useState('monthly'); // 'daily' | 'weekly' | 'monthly'
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Navigate dates
  const handlePrev = () => {
    const d = new Date(selectedDate);
    if (viewMode === 'monthly') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'weekly') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNext = () => {
    const d = new Date(selectedDate);
    if (viewMode === 'monthly') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'weekly') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const selectedDateStr = selectedDate.toISOString().split('T')[0];

  // Selected date tasks
  const dayTasks = state.tasks.filter((t) => t.dueDate === selectedDateStr && t.status !== 'archived');

  // Days in month for calendar grid
  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Padding
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const daysGrid = getDaysInMonth();

  return (
    <div className="calendar-view animate-fade-in">
      {/* Calendar Header Controls */}
      <div className="glass-card calendar-controls-card">
        <div className="cal-header-top">
          <button className="btn-icon mini-icon-btn" onClick={handlePrev}>
            <ChevronLeft size={18} />
          </button>

          <h3 className="cal-title font-heading">
            {selectedDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
              ...(viewMode === 'daily' ? { day: 'numeric', weekday: 'short' } : {})
            })}
          </h3>

          <button className="btn-icon mini-icon-btn" onClick={handleNext}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="view-mode-tabs">
          {['daily', 'weekly', 'monthly'].map((mode) => (
            <button
              key={mode}
              className={`view-mode-btn ${viewMode === mode ? 'active' : ''}`}
              onClick={() => setViewMode(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* MONTHLY GRID VIEW */}
      {viewMode === 'monthly' && (
        <div className="glass-card month-grid-card">
          <div className="weekdays-row">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => (
              <span key={w} className="weekday-header">{w}</span>
            ))}
          </div>

          <div className="days-grid">
            {daysGrid.map((dateObj, idx) => {
              if (!dateObj) return <div key={`empty_${idx}`} className="day-cell empty" />;

              const dateStr = dateObj.toISOString().split('T')[0];
              const isSelected = dateStr === selectedDateStr;
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              const count = state.tasks.filter((t) => t.dueDate === dateStr && t.status !== 'archived').length;

              return (
                <div
                  key={dateStr}
                  className={`day-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => setSelectedDate(dateObj)}
                >
                  <span className="day-num">{dateObj.getDate()}</span>
                  {count > 0 && (
                    <div className="day-dots">
                      <span className="task-dot" />
                      {count > 1 && <span className="task-dot-count">+{count}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY TASKS INSPECTOR */}
      <div className="dashboard-section">
        <div className="section-header">
          <div className="section-title-group">
            <CalendarIcon size={18} className="text-primary" />
            <h3 className="section-title">
              Tasks for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </h3>
          </div>
          <button className="text-action-btn" onClick={onOpenTaskModal}>
            + Add Task
          </button>
        </div>

        {dayTasks.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title="No tasks for this day."
            subtitle="No tasks, recurring items, or deadlines scheduled for this date."
            actionLabel="Schedule Task"
            onAction={onOpenTaskModal}
          />
        ) : (
          <div className="day-tasks-list">
            {dayTasks.map((task) => {
              const isDone = task.status === 'completed';
              return (
                <div key={task.id} className={`glass-card cal-task-card ${isDone ? 'done' : ''}`}>
                  <button
                    className="check-btn"
                    onClick={() => storage.completeTask(task.id)}
                  >
                    {isDone ? (
                      <CheckCircle2 size={20} className="text-emerald" />
                    ) : (
                      <Circle size={20} className="text-muted" />
                    )}
                  </button>
                  <div className="cal-task-info">
                    <span className={`cal-task-title ${isDone ? 'line-through' : ''}`}>
                      {task.title}
                    </span>
                    <div className="cal-task-meta">
                      <span className="cat-tag">{task.category}</span>
                      {task.dueTime && (
                        <span className="time-tag"><Clock size={12} /> {task.dueTime}</span>
                      )}
                      {task.repeat && task.repeat.frequency !== 'never' && (
                        <span className="repeat-tag"><Repeat size={12} /> {task.repeat.frequency}</span>
                      )}
                    </div>
                  </div>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .calendar-view {
          padding: 1rem 1.25rem 2rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .calendar-controls-card {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .cal-header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cal-title {
          font-size: 1.1rem;
          font-weight: 700;
        }
        .view-mode-tabs {
          display: flex;
          background: var(--bg-surface-elevated);
          padding: 0.25rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
        }
        .view-mode-btn {
          flex: 1;
          padding: 0.4rem;
          font-size: 0.775rem;
          font-weight: 600;
          color: var(--text-muted);
          border-radius: var(--radius-full);
        }
        .view-mode-btn.active {
          background: var(--grad-primary);
          color: #fff;
        }
        .month-grid-card {
          padding: 1rem;
        }
        .weekdays-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          margin-bottom: 0.5rem;
        }
        .weekday-header {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-subtle);
          text-transform: uppercase;
        }
        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.35rem;
        }
        .day-cell {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          background: var(--bg-surface-elevated);
          border: 1px solid transparent;
          cursor: pointer;
          position: relative;
        }
        .day-cell.empty { background: transparent; cursor: default; }
        .day-cell.today { border-color: var(--accent-primary); }
        .day-cell.selected { background: var(--grad-primary); color: #fff; }
        .day-num { font-size: 0.85rem; font-weight: 600; }
        .day-dots {
          display: flex;
          align-items: center;
          gap: 0.15rem;
          position: absolute;
          bottom: 3px;
        }
        .task-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--accent-cyan);
        }
        .task-dot-count { font-size: 0.55rem; color: var(--accent-cyan); font-weight: 700; }
        .day-tasks-list { display: flex; flex-direction: column; gap: 0.6rem; }
        .cal-task-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem;
        }
        .cal-task-card.done { opacity: 0.6; }
        .cal-task-info { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
        .cal-task-title { font-size: 0.9rem; font-weight: 600; }
        .cal-task-meta { display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; color: var(--text-subtle); }
        .cat-tag, .time-tag, .repeat-tag { display: inline-flex; align-items: center; gap: 0.2rem; }
      `}</style>
    </div>
  );
};

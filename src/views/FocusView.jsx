import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Timer as TimerIcon, History, Sparkles } from 'lucide-react';
import { storage } from '../utils/storage';
import { soundEngine } from '../utils/soundEngine';

export const FocusView = ({ state }) => {
  const [mode, setMode] = useState('pomodoro'); // 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom'
  const [customMinutes, setCustomMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');

  // Mode Durations in seconds
  const modeDurations = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
    custom: customMinutes * 60
  };

  useEffect(() => {
    if (mode !== 'custom') {
      setTimeLeft(modeDurations[mode]);
      setIsRunning(false);
    }
  }, [mode]);

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Completed session!
      setIsRunning(false);
      soundEngine.playCompletionBell();
      storage.logFocusSession({
        mode,
        durationSeconds: modeDurations[mode],
        taskTitle: taskTitle || (mode === 'pomodoro' ? 'Pomodoro Focus' : 'Break Session')
      });
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'custom' ? customMinutes * 60 : modeDurations[mode]);
  };

  const handleSkip = () => {
    setIsRunning(false);
    setTimeLeft(0);
  };

  const handleCustomTimeChange = (mins) => {
    const validMins = Math.max(1, Math.min(120, parseInt(mins, 10) || 1));
    setCustomMinutes(validMins);
    if (mode === 'custom') {
      setTimeLeft(validMins * 60);
      setIsRunning(false);
    }
  };

  // Format Time
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const totalModeDuration = mode === 'custom' ? customMinutes * 60 : modeDurations[mode];
  const progressPercent = totalModeDuration > 0 ? ((totalModeDuration - timeLeft) / totalModeDuration) * 100 : 0;

  const focusLogs = state.focusLogs || [];

  return (
    <div className="focus-view animate-fade-in">
      {/* Mode Selector */}
      <div className="glass-card mode-selector-card">
        <div className="mode-pills">
          <button
            className={`mode-btn ${mode === 'pomodoro' ? 'active' : ''}`}
            onClick={() => setMode('pomodoro')}
          >
            Pomodoro (25m)
          </button>
          <button
            className={`mode-btn ${mode === 'shortBreak' ? 'active' : ''}`}
            onClick={() => setMode('shortBreak')}
          >
            Short Break (5m)
          </button>
          <button
            className={`mode-btn ${mode === 'longBreak' ? 'active' : ''}`}
            onClick={() => setMode('longBreak')}
          >
            Long Break (15m)
          </button>
          <button
            className={`mode-btn ${mode === 'custom' ? 'active' : ''}`}
            onClick={() => setMode('custom')}
          >
            Custom
          </button>
        </div>

        {mode === 'custom' && (
          <div className="custom-mins-row">
            <label>Custom Duration (minutes):</label>
            <input
              type="number"
              className="form-input custom-input"
              value={customMinutes}
              onChange={(e) => handleCustomTimeChange(e.target.value)}
              min="1"
              max="120"
            />
          </div>
        )}
      </div>

      {/* Main Focus Ring Timer */}
      <div className="glass-card timer-main-card">
        <div className="task-label-input-box">
          <input
            type="text"
            className="timer-task-input"
            placeholder="What are you focusing on?"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
        </div>

        <div className="big-timer-ring-container">
          <svg className="timer-svg" viewBox="0 0 240 240">
            <defs>
              <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
            </defs>
            <circle cx="120" cy="120" r="100" className="timer-bg-circle" />
            <circle
              cx="120"
              cy="120"
              r="100"
              className="timer-fg-circle"
              style={{
                strokeDasharray: 628,
                strokeDashoffset: 628 - (progressPercent / 100) * 628
              }}
              transform="rotate(-90 120 120)"
            />
          </svg>

          <div className="timer-display-inner">
            <span className="big-time-digits font-heading">{timeFormatted}</span>
            <span className="timer-status-lbl">
              {isRunning ? 'Deep Work In Progress' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="timer-controls-row">
          <button className="btn-icon control-btn" onClick={handleReset} title="Reset Timer">
            <RotateCcw size={20} />
          </button>

          <button className="btn-primary big-play-btn" onClick={handleStartPause}>
            {isRunning ? <Pause size={28} /> : <Play size={28} />}
          </button>

          <button className="btn-icon control-btn" onClick={handleSkip} title="Skip Session">
            <SkipForward size={20} />
          </button>
        </div>
      </div>

      {/* Session History Log */}
      <div className="dashboard-section">
        <div className="section-header">
          <div className="section-title-group">
            <History size={18} className="text-secondary" />
            <h3 className="section-title">Focus History Log</h3>
          </div>
        </div>

        {focusLogs.length === 0 ? (
          <div className="glass-card compact-empty">
            <Sparkles size={18} className="text-muted" />
            <span>No focus sessions recorded yet. Start your first session above!</span>
          </div>
        ) : (
          <div className="focus-logs-list">
            {focusLogs.slice(0, 10).map((log) => {
              const dateObj = new Date(log.completedAt);
              const mins = Math.round(log.durationSeconds / 60);

              return (
                <div key={log.id} className="glass-card focus-log-item">
                  <div className="log-left">
                    <TimerIcon size={18} className="text-primary" />
                    <div className="log-details">
                      <span className="log-title">{log.taskTitle || 'Focus Session'}</span>
                      <span className="log-time">{dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <span className="log-duration-badge">{mins} mins</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .focus-view {
          padding: 1rem 1.25rem 2rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .mode-selector-card { display: flex; flex-direction: column; gap: 0.75rem; }
        .mode-pills {
          display: flex;
          background: var(--bg-surface-elevated);
          padding: 0.25rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          overflow-x: auto;
        }
        .mode-btn {
          flex: 1;
          padding: 0.45rem 0.65rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          border-radius: var(--radius-full);
          white-space: nowrap;
        }
        .mode-btn.active {
          background: var(--grad-primary);
          color: #fff;
        }
        .custom-mins-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .custom-input { width: 80px; text-align: center; }
        .timer-main-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem 1.5rem;
        }
        .task-label-input-box { width: 100%; }
        .timer-task-input {
          width: 100%;
          background: none;
          border: none;
          border-bottom: 1px solid var(--border-subtle);
          text-align: center;
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-main);
          padding: 0.5rem;
          outline: none;
        }
        .timer-task-input:focus { border-color: var(--accent-primary); }
        .big-timer-ring-container {
          position: relative;
          width: 220px;
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .timer-svg { width: 100%; height: 100%; }
        .timer-bg-circle {
          fill: none;
          stroke: rgba(255, 255, 255, 0.06);
          stroke-width: 12;
        }
        .timer-fg-circle {
          fill: none;
          stroke: url(#timerGrad);
          stroke-width: 12;
          stroke-linecap: round;
          transition: stroke-dashoffset 1s linear;
        }
        .timer-display-inner {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .big-time-digits {
          font-size: 2.75rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .timer-status-lbl {
          font-size: 0.725rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 0.4rem;
        }
        .timer-controls-row {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .control-btn {
          width: 48px;
          height: 48px;
        }
        .big-play-btn {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          padding: 0;
        }
        .focus-logs-list { display: flex; flex-direction: column; gap: 0.6rem; }
        .focus-log-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem;
        }
        .log-left { display: flex; align-items: center; gap: 0.75rem; }
        .log-details { display: flex; flex-direction: column; }
        .log-title { font-size: 0.9rem; font-weight: 600; }
        .log-time { font-size: 0.7rem; color: var(--text-subtle); }
        .log-duration-badge {
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent-primary);
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

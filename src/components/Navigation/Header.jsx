import React, { useState, useEffect } from 'react';
import { Mic, Plus, Sparkles, Bell } from 'lucide-react';

export const Header = ({ userName = 'Shanmukha', onOpenVoice, onQuickAddTask }) => {
  const [greeting, setGreeting] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting('Good Morning');
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }

      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      setCurrentDateStr(new Date().toLocaleDateString('en-US', options));
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand-group">
          {/* TakMan TM Monogram Logo */}
          <div className="app-logo">
            <svg viewBox="0 0 512 512" className="logo-svg">
              <rect width="512" height="512" rx="128" fill="#0b0e17"/>
              <path d="M 88 104 C 88 92.9 96.9 84 108 84 L 404 84 C 415.1 84 424 92.9 424 104 L 424 160 C 424 171.1 415.1 180 404 180 L 108 180 C 96.9 180 88 171.1 88 160 Z" fill="#8b5cf6"/>
              <path d="M 224 180 L 288 180 L 288 404 C 288 415.1 279.1 424 268 424 L 244 424 C 232.9 424 224 415.1 224 404 Z" fill="#8b5cf6"/>
              <path d="M 120 180 L 176 180 L 224 316 L 168 316 L 120 212 Z" fill="#6366f1"/>
              <path d="M 392 180 L 336 180 L 288 316 L 344 316 L 392 212 Z" fill="#6366f1"/>
            </svg>
          </div>
          <div className="brand-text">
            <h1 className="app-title text-gradient">TakMan</h1>
            <span className="app-tagline">Plan Better. Do More.</span>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn-icon voice-btn"
            onClick={onOpenVoice}
            title="Voice Assistant"
            aria-label="Voice Assistant"
          >
            <Mic className="icon-pulse" size={18} />
          </button>
          <button
            className="btn-icon add-btn"
            onClick={onQuickAddTask}
            title="Quick Add Task"
            aria-label="Quick Add Task"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="header-greeting-bar">
        <div className="user-greeting">
          <span className="greeting-subtitle">{greeting},</span>
          <h2 className="user-name">{userName}</h2>
        </div>
        <div className="date-chip">
          <span>{currentDateStr}</span>
        </div>
      </div>

      <style>{`
        .app-header {
          padding: 1.25rem 1.25rem 0.75rem 1.25rem;
          background: rgba(18, 21, 30, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-subtle);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.85rem;
        }
        .brand-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .app-logo {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
        }
        .logo-svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        .brand-text {
          display: flex;
          flex-direction: column;
        }
        .app-title {
          font-size: 1.25rem;
          font-weight: 800;
          line-height: 1.1;
        }
        .app-tagline {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 500;
          letter-spacing: 0.04em;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .voice-btn {
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent-primary);
          border-color: rgba(99, 102, 241, 0.3);
        }
        .voice-btn:hover {
          background: rgba(99, 102, 241, 0.25);
        }
        .icon-pulse {
          color: #8b5cf6;
        }
        .add-btn {
          background: var(--grad-primary);
          color: #fff;
          border: none;
          box-shadow: 0 2px 10px rgba(99, 102, 241, 0.35);
        }
        .header-greeting-bar {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }
        .greeting-subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
          display: block;
        }
        .user-name {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text-main);
          line-height: 1.15;
        }
        .date-chip {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          padding: 0.3rem 0.65rem;
          border-radius: var(--radius-full);
          font-size: 0.725rem;
          font-weight: 600;
          color: var(--text-muted);
        }
      `}</style>
    </header>
  );
};

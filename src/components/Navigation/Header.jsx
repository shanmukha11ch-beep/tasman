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
          {/* Logo with bold T and checkmark concept */}
          <div className="app-logo">
            <svg viewBox="0 0 512 512" className="logo-svg">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
              <rect width="512" height="512" rx="128" fill="#12151e" />
              <g transform="translate(64, 64)">
                <path d="M 40 50 Q 192 40 344 50 C 364 51 364 80 344 80 L 40 80 C 20 80 20 50 40 50 Z" fill="url(#logoGrad)" />
                <path d="M 160 80 L 224 80 L 224 240 C 224 270 190 290 160 270 L 160 80 Z" fill="url(#logoGrad)" opacity="0.85" />
                <path d="M 120 220 L 190 290 L 340 140" fill="none" stroke="url(#logoGrad)" strokeWidth="42" strokeLinecap="round" strokeLinejoin="round" />
              </g>
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

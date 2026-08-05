import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Timer,
  BarChart3,
  User
} from 'lucide-react';

export const BottomNav = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'focus', label: 'Focus', icon: Timer },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="bottom-nav">
      <div className="nav-container">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onChangeTab(tab.id)}
              aria-label={tab.label}
            >
              <div className="icon-wrapper">
                <IconComponent size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                {isActive && <div className="active-glow" />}
              </div>
              <span className="nav-label">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <style>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 480px;
          background: rgba(18, 21, 30, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--border-subtle);
          z-index: 900;
          padding: 0.4rem 0.5rem 0.6rem 0.5rem;
        }
        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-around;
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.2rem;
          color: var(--text-subtle);
          background: none;
          border: none;
          padding: 0.35rem 0.5rem;
          border-radius: var(--radius-md);
          width: 100%;
          position: relative;
          transition: color var(--transition-fast), transform var(--transition-fast);
        }
        .nav-item.active {
          color: var(--text-main);
        }
        .nav-item:active {
          transform: scale(0.92);
        }
        .icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
        }
        .active-glow {
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--grad-primary);
          opacity: 0.25;
          filter: blur(8px);
          z-index: -1;
        }
        .nav-label {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        .nav-item.active .nav-label {
          color: var(--accent-primary);
        }
      `}</style>
    </nav>
  );
};

import React, { useRef, useState } from 'react';
import {
  User,
  Palette,
  Bell,
  Download,
  Upload,
  Info,
  Mic,
  Check,
  Smartphone,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { storage } from '../utils/storage';

export const ProfileView = ({ state, onOpenVoice }) => {
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null);

  const currentTheme = state.settings?.theme || 'midnight-oled';

  const themes = [
    { id: 'midnight-oled', name: 'Midnight OLED', color: '#6366f1' },
    { id: 'deep-space', name: 'Deep Space', color: '#3b82f6' },
    { id: 'obsidian-emerald', name: 'Obsidian Emerald', color: '#10b981' },
    { id: 'cyber-neon', name: 'Cyber Neon', color: '#d946ef' }
  ];

  const handleSelectTheme = (themeId) => {
    storage.updateSettings({ theme: themeId });
    document.body.setAttribute('data-theme', themeId);
  };

  const handleToggleNotifications = () => {
    const nextVal = !state.settings?.notifications;
    storage.updateSettings({ notifications: nextVal });

    if (nextVal && 'Notification' in window) {
      Notification.requestPermission();
    }
  };

  const handleExport = () => {
    storage.exportData();
  };

  const handleImportFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = storage.importData(event.target.result);
      if (res.success) {
        setImportStatus('Data restored successfully!');
      } else {
        setImportStatus(`Restore error: ${res.error}`);
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  const voiceCommandsList = [
    { cmd: '"Add a task [title]"', desc: 'Create a new task scheduled for today' },
    { cmd: '"Add ₹500 to savings"', desc: 'Instantly add money to your savings goal' },
    { cmd: '"Log my sleep"', desc: 'Log last night sleep record' },
    { cmd: '"Start focus session"', desc: 'Open the Pomodoro timer module' },
    { cmd: '"What should I do today?"', desc: 'Summary of pending priorities' }
  ];

  return (
    <div className="profile-view animate-fade-in">
      {/* User Card */}
      <div className="glass-card user-profile-card">
        <div className="user-avatar-circle">
          <span className="avatar-initial font-heading">S</span>
        </div>
        <div className="user-card-info">
          <h2 className="user-display-name">Shanmukha</h2>
          <span className="user-role-badge">TakMan Pro OS</span>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="glass-card settings-section-card">
        <div className="settings-header">
          <Palette size={18} className="text-primary" />
          <h3 className="settings-title font-heading">Appearance</h3>
        </div>

        <div className="theme-options-grid">
          {themes.map((t) => (
            <div
              key={t.id}
              className={`theme-chip ${currentTheme === t.id ? 'active' : ''}`}
              onClick={() => handleSelectTheme(t.id)}
            >
              <div className="theme-dot" style={{ backgroundColor: t.color }} />
              <span className="theme-name">{t.name}</span>
              {currentTheme === t.id && <Check size={14} className="check-icon" />}
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card settings-section-card">
        <div className="settings-header">
          <Bell size={18} className="text-secondary" />
          <h3 className="settings-title font-heading">Notifications</h3>
        </div>

        <div className="setting-toggle-row">
          <div className="setting-label-box">
            <span className="setting-name">Task & Focus Reminders</span>
            <span className="setting-subtext">Enable browser push notifications</span>
          </div>
          <button
            className={`toggle-switch ${state.settings?.notifications ? 'on' : ''}`}
            onClick={handleToggleNotifications}
          >
            <div className="toggle-thumb" />
          </button>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="glass-card settings-section-card">
        <div className="settings-header">
          <Download size={18} className="text-emerald" />
          <h3 className="settings-title font-heading">Backup & Restore</h3>
        </div>

        <p className="section-desc-text">
          All data is saved locally offline in your browser. Export backups regularly for safekeeping.
        </p>

        <div className="backup-actions-row">
          <button className="btn-secondary flex-1" onClick={handleExport}>
            <Download size={16} /> Export JSON
          </button>
          <button className="btn-secondary flex-1" onClick={() => fileInputRef.current.click()}>
            <Upload size={16} /> Restore Data
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".json"
            onChange={handleImportFileChange}
          />
        </div>

        {importStatus && (
          <div className="status-toast">{importStatus}</div>
        )}
      </div>

      {/* Voice Commands Guide */}
      <div className="glass-card settings-section-card">
        <div className="settings-header">
          <Mic size={18} className="text-cyan" />
          <h3 className="settings-title font-heading">Voice Commands</h3>
        </div>

        <div className="voice-guide-list">
          {voiceCommandsList.map((item, idx) => (
            <div key={idx} className="voice-guide-item">
              <span className="cmd-text">{item.cmd}</span>
              <span className="cmd-desc">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="glass-card settings-section-card about-card">
        <div className="settings-header">
          <Info size={18} className="text-muted" />
          <h3 className="settings-title font-heading">About TakMan</h3>
        </div>

        <div className="about-info-body">
          <div className="about-brand-row">
            <h4 className="text-gradient">TakMan OS v1.0.0</h4>
            <span className="version-tag font-heading">Release</span>
          </div>
          <p className="about-tagline font-heading">"Plan Better. Do More."</p>
          <span className="user-dedication">Crafted exclusively for Shanmukha</span>
        </div>
      </div>

      <style>{`
        .profile-view {
          padding: 1rem 1.25rem 2rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .user-profile-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem;
        }
        .user-avatar-circle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--grad-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
        }
        .avatar-initial {
          font-size: 1.6rem;
          font-weight: 800;
          color: #fff;
        }
        .user-card-info {
          display: flex;
          flex-direction: column;
        }
        .user-display-name {
          font-size: 1.35rem;
          font-weight: 800;
        }
        .user-role-badge {
          font-size: 0.725rem;
          color: var(--accent-primary);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .settings-section-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.25rem;
        }
        .settings-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .settings-title {
          font-size: 1.05rem;
          font-weight: 700;
        }
        .theme-options-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.6rem;
        }
        .theme-chip {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 0.825rem;
          font-weight: 600;
        }
        .theme-chip.active {
          border-color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.12);
        }
        .theme-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        .check-icon { margin-left: auto; color: var(--accent-primary); }
        .setting-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .setting-label-box { display: flex; flex-direction: column; }
        .setting-name { font-size: 0.9rem; font-weight: 600; }
        .setting-subtext { font-size: 0.75rem; color: var(--text-muted); }
        .toggle-switch {
          width: 46px;
          height: 26px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          padding: 2px;
          transition: background 0.3s;
        }
        .toggle-switch.on {
          background: var(--accent-emerald);
        }
        .toggle-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fff;
          transition: transform 0.3s;
        }
        .toggle-switch.on .toggle-thumb {
          transform: translateX(20px);
        }
        .section-desc-text { font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; }
        .backup-actions-row { display: flex; gap: 0.75rem; }
        .status-toast { font-size: 0.8rem; color: var(--accent-emerald); font-weight: 600; }
        .voice-guide-list { display: flex; flex-direction: column; gap: 0.6rem; }
        .voice-guide-item {
          display: flex;
          flex-direction: column;
          background: var(--bg-surface-elevated);
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-md);
        }
        .cmd-text { font-size: 0.85rem; font-weight: 700; color: var(--accent-cyan); }
        .cmd-desc { font-size: 0.75rem; color: var(--text-muted); }
        .about-info-body { display: flex; flex-direction: column; gap: 0.35rem; }
        .about-brand-row { display: flex; align-items: center; justify-content: space-between; }
        .about-brand-row h4 { font-size: 1.1rem; font-weight: 800; }
        .version-tag { font-size: 0.65rem; background: rgba(99, 102, 241, 0.15); color: var(--accent-primary); padding: 0.15rem 0.5rem; border-radius: var(--radius-full); font-weight: 700; }
        .about-tagline { font-size: 0.9rem; font-weight: 600; color: var(--text-main); }
        .user-dedication { font-size: 0.75rem; color: var(--text-subtle); }
      `}</style>
    </div>
  );
};

import React from 'react';
import { Inbox, Plus } from 'lucide-react';

export const EmptyState = ({
  icon: IconComponent = Inbox,
  title = 'No items yet.',
  subtitle = 'Create your first item to get started.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="empty-state-card glass-card">
      <div className="empty-icon-glow">
        <IconComponent size={28} className="empty-icon" />
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-subtitle">{subtitle}</p>

      {actionLabel && onAction && (
        <button className="btn-primary empty-btn" onClick={onAction}>
          <Plus size={16} />
          <span>{actionLabel}</span>
        </button>
      )}

      <style>{`
        .empty-state-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2.25rem 1.5rem;
          margin: 0.5rem 0;
        }
        .empty-icon-glow {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-full);
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.15);
        }
        .empty-icon {
          color: var(--accent-primary);
        }
        .empty-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.35rem;
        }
        .empty-subtitle {
          font-size: 0.825rem;
          color: var(--text-muted);
          max-width: 280px;
          margin-bottom: 1.25rem;
          line-height: 1.4;
        }
        .empty-btn {
          padding: 0.65rem 1.25rem;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};

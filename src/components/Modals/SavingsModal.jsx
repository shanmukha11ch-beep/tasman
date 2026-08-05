import React, { useState } from 'react';
import { X, PiggyBank, Plus, Minus, Target } from 'lucide-react';
import { storage } from '../../utils/storage';

export const SavingsModal = ({ isOpen, onClose, savings = { current: 0, goal: 0 } }) => {
  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'remove' | 'goal'
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // Goal fields
  const [goalAmount, setGoalAmount] = useState(savings.goal || '');
  const [goalTitle, setGoalTitle] = useState(savings.goalTitle || '');

  if (!isOpen) return null;

  const handleAction = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    if (activeTab === 'add') {
      storage.addSavingsMoney(num, note || 'Added savings');
    } else if (activeTab === 'remove') {
      storage.removeSavingsMoney(num, note || 'Withdrew savings');
    }
    setAmount('');
    setNote('');
    onClose();
  };

  const handleSetGoal = (e) => {
    e.preventDefault();
    const num = parseFloat(goalAmount);
    if (isNaN(num) || num <= 0) return;

    storage.setSavingsGoal(num, goalTitle || 'Savings Goal');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="title-with-icon">
            <PiggyBank size={20} className="text-cyan" />
            <h3 className="modal-title font-heading">Manage Savings</h3>
          </div>
          <button className="btn-icon mini-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="savings-tabs-row">
          <button
            className={`savings-tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <Plus size={16} /> Add Money
          </button>
          <button
            className={`savings-tab ${activeTab === 'remove' ? 'active' : ''}`}
            onClick={() => setActiveTab('remove')}
          >
            <Minus size={16} /> Remove
          </button>
          <button
            className={`savings-tab ${activeTab === 'goal' ? 'active' : ''}`}
            onClick={() => setActiveTab('goal')}
          >
            <Target size={16} /> Set Goal
          </button>
        </div>

        {activeTab === 'goal' ? (
          <form onSubmit={handleSetGoal} className="task-form-body">
            <div className="form-group">
              <label>Goal Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Emergency Fund / Laptop"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Target Amount (₹) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 50000"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn-primary modal-submit-btn">
              Save Savings Goal
            </button>
          </form>
        ) : (
          <form onSubmit={handleAction} className="task-form-body">
            <div className="form-group">
              <label>Amount (₹) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Note / Reason</label>
              <input
                type="text"
                className="form-input"
                placeholder={activeTab === 'add' ? 'e.g. Weekly deposit' : 'e.g. Purchase expense'}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary modal-submit-btn">
              {activeTab === 'add' ? 'Add Money' : 'Remove Money'}
            </button>
          </form>
        )}
      </div>

      <style>{`
        .title-with-icon { display: flex; align-items: center; gap: 0.5rem; }
        .savings-tabs-row {
          display: flex;
          background: var(--bg-surface-elevated);
          padding: 0.25rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          margin-bottom: 1.25rem;
        }
        .savings-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.45rem 0.5rem;
          font-size: 0.775rem;
          font-weight: 600;
          color: var(--text-muted);
          border-radius: var(--radius-full);
        }
        .savings-tab.active {
          background: var(--grad-primary);
          color: #fff;
        }
      `}</style>
    </div>
  );
};

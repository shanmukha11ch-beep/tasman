import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  PiggyBank,
  Moon,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar as CalendarIcon
} from 'lucide-react';
import { storage } from '../utils/storage';
import { getSleepQualityLabel } from '../utils/sleepUtils';
import { ProgressRing } from '../components/Charts/SvgCharts';
import { EmptyState } from '../components/EmptyState';

export const HomeView = ({ state, onNavigate, onOpenTaskModal, onOpenHabitModal, onEditHabit, onOpenSavingsModal, onOpenSleepModal }) => {
  const [sleepExpanded, setSleepExpanded] = useState(false);
  const [savingsHistoryExpanded, setSavingsHistoryExpanded] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter Tasks
  const todayTasks = state.tasks.filter((t) => t.dueDate === todayStr && t.status !== 'archived');
  const completedTodayCount = todayTasks.filter((t) => t.status === 'completed').length;
  const todayProgressPercent = todayTasks.length > 0 ? (completedTodayCount / todayTasks.length) * 100 : 0;

  // Priorities
  const todayPriorities = todayTasks.filter(
    (t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'completed'
  );

  // Upcoming Tasks (next 7 days, excluding today)
  const upcomingTasks = state.tasks.filter((t) => {
    if (t.status === 'completed' || t.status === 'archived') return false;
    return t.dueDate > todayStr;
  }).slice(0, 4);

  // Savings Logic
  const savings = state.savings || { current: 0, goal: 0, history: [] };
  const savingsPercent = savings.goal > 0 ? Math.min(100, (savings.current / savings.goal) * 100) : 0;

  // Sleep Logic
  const sleepRecords = state.sleep?.records || [];
  const latestSleep = sleepRecords[0] || null;

  // Quick stats
  const pendingTasksCount = state.tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;
  const activeHabits = (state.habits || []).filter((h) => h.status !== 'archived');
  const activeHabitsCount = activeHabits.length;
  const totalFocusSeconds = (state.focusLogs || []).reduce((acc, f) => acc + (f.durationSeconds || 0), 0);
  const totalFocusMins = Math.round(totalFocusSeconds / 60);

  // Estimate completion date for savings
  const calculateSavingsEstimate = () => {
    if (!savings.goal || savings.current >= savings.goal) return 'Goal Reached';
    if (!savings.history || savings.history.length === 0) return 'Needs more history';

    const addTxs = savings.history.filter((h) => h.type === 'add');
    if (addTxs.length === 0) return 'No deposits yet';

    const totalAdded = addTxs.reduce((acc, t) => acc + t.amount, 0);
    const avgPerTx = totalAdded / addTxs.length;
    const remaining = savings.goal - savings.current;
    const txsNeeded = Math.ceil(remaining / avgPerTx);

    const target = new Date();
    target.setDate(target.getDate() + txsNeeded * 7); // Estimate weekly deposits
    return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="home-dashboard animate-fade-in">
      {/* 3. Progress Overview */}
      <div className="dashboard-section">
        <div className="glass-card progress-overview-card">
          <div className="progress-overview-header">
            <div>
              <span className="section-label">Today's Focus</span>
              <h3 className="card-title">Daily Progress</h3>
              <p className="card-subtitle">
                {todayTasks.length === 0
                  ? 'No tasks scheduled for today'
                  : `${completedTodayCount} of ${todayTasks.length} tasks completed`}
              </p>
            </div>
            <ProgressRing percent={todayProgressPercent} size={70} strokeWidth={7} />
          </div>
        </div>
      </div>

      {/* 4. Today's Priorities */}
      <div className="dashboard-section">
        <div className="section-header">
          <div className="section-title-group">
            <AlertCircle size={18} className="priority-icon" />
            <h3 className="section-title">Today's Priorities</h3>
          </div>
        </div>

        {todayPriorities.length === 0 ? (
          <div className="glass-card compact-empty">
            <Sparkles size={18} className="text-muted" />
            <span>No urgent priorities pending today!</span>
          </div>
        ) : (
          <div className="priority-list">
            {todayPriorities.map((task) => (
              <div key={task.id} className="glass-card priority-card">
                <button
                  className="check-btn"
                  onClick={() => storage.completeTask(task.id)}
                  title="Mark complete"
                >
                  <Circle size={20} className="text-muted" />
                </button>
                <div className="priority-info">
                  <span className="priority-task-title">{task.title}</span>
                  <div className="priority-meta">
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    <span className="meta-time"><Clock size={12} /> {task.dueTime || '12:00'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Today's Tasks */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Today's Tasks</h3>
          <button className="text-action-btn" onClick={() => onNavigate('tasks')}>
            View All ({todayTasks.length})
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <EmptyState
            title="No tasks yet."
            subtitle="Create your first task to start planning your day."
            actionLabel="Create Task"
            onAction={onOpenTaskModal}
          />
        ) : (
          <div className="tasks-compact-list">
            {todayTasks.map((task) => {
              const isDone = task.status === 'completed';
              return (
                <div key={task.id} className={`glass-card task-item-row ${isDone ? 'completed' : ''}`}>
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
                  <div className="task-row-details">
                    <span className={`task-title-text ${isDone ? 'line-through' : ''}`}>
                      {task.title}
                    </span>
                    <span className="task-category-tag">{task.category}</span>
                  </div>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Upcoming Tasks */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Upcoming Tasks</h3>
          <button className="text-action-btn" onClick={() => onNavigate('calendar')}>
            Calendar
          </button>
        </div>

        {upcomingTasks.length === 0 ? (
          <div className="glass-card compact-empty">
            <CalendarIcon size={18} className="text-muted" />
            <span>No upcoming tasks scheduled for future dates.</span>
          </div>
        ) : (
          <div className="upcoming-list">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="glass-card upcoming-card">
                <div className="upcoming-date-badge">
                  <span className="up-day">{new Date(task.dueDate).getDate()}</span>
                  <span className="up-month">
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
                <div className="upcoming-info">
                  <span className="upcoming-title">{task.title}</span>
                  <span className="upcoming-cat">{task.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Habits */}
      <div className="dashboard-section">
        <div className="section-header">
          <div className="section-title-group">
            <Flame size={18} className="text-amber" />
            <h3 className="section-title">Habits</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="text-action-btn" onClick={onOpenHabitModal}>
              + Add Habit
            </button>
            <span style={{ color: 'var(--text-subtle)', fontSize: '0.8rem' }}>|</span>
            <button className="text-action-btn" onClick={() => onNavigate('stats')}>
              Habit Tracker
            </button>
          </div>
        </div>

        {activeHabits.length === 0 ? (
          <EmptyState
            icon={Flame}
            title="No habits yet."
            subtitle="Track daily habits and build unstoppable streaks."
            actionLabel="Add Habit"
            onAction={onOpenHabitModal}
          />
        ) : (
          <div className="habits-quick-grid">
            {activeHabits.map((habit) => {
              const isCompletedToday = habit.completions && habit.completions[todayStr];
              return (
                <div
                  key={habit.id}
                  className={`glass-card habit-quick-card ${isCompletedToday ? 'done' : ''}`}
                  onClick={() => storage.toggleHabitCompletion(habit.id, todayStr)}
                >
                  <div className="habit-quick-top">
                    <Flame size={20} className={isCompletedToday ? 'text-amber' : 'text-muted'} style={habit.color ? { color: habit.color } : {}} />
                    <span className="streak-count">{habit.streak || 0}d streak</span>
                  </div>
                  <span className="habit-quick-title">{habit.title}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 8. Quick Statistics */}
      <div className="dashboard-section">
        <h3 className="section-title mb-3">Quick Statistics</h3>
        <div className="quick-stats-grid">
          <div className="glass-card stat-mini-card">
            <span className="stat-value">{pendingTasksCount}</span>
            <span className="stat-label">Pending Tasks</span>
          </div>
          <div className="glass-card stat-mini-card">
            <span className="stat-value">{activeHabitsCount}</span>
            <span className="stat-label">Active Habits</span>
          </div>
          <div className="glass-card stat-mini-card">
            <span className="stat-value">{totalFocusMins}m</span>
            <span className="stat-label">Focus Time</span>
          </div>
        </div>
      </div>

      {/* 9. Savings Widget */}
      <div className="dashboard-section">
        <div className="section-header">
          <div className="section-title-group">
            <PiggyBank size={18} className="text-cyan" />
            <h3 className="section-title">Savings Goal</h3>
          </div>
          {savings.goal > 0 && (
            <button className="text-action-btn" onClick={onOpenSavingsModal}>
              Manage
            </button>
          )}
        </div>

        {savings.goal === 0 ? (
          <EmptyState
            icon={PiggyBank}
            title="No savings goal set yet."
            subtitle="Set your personal savings goal and track your financial growth."
            actionLabel="Set Savings Goal"
            onAction={onOpenSavingsModal}
          />
        ) : (
          <div className="glass-card savings-widget-card">
            <div className="savings-main">
              <div className="savings-amounts">
                <span className="savings-label">{savings.goalTitle || 'Personal Savings'}</span>
                <div className="savings-current">₹{savings.current.toLocaleString('en-IN')}</div>
                <span className="savings-goal-target">Goal: ₹{savings.goal.toLocaleString('en-IN')}</span>
              </div>
              <div className="savings-percent-badge">{Math.round(savingsPercent)}%</div>
            </div>

            {/* Savings Progress Bar */}
            <div className="savings-progress-bar">
              <div className="savings-progress-fill" style={{ width: `${savingsPercent}%` }} />
            </div>

            <div className="savings-meta-row">
              <span className="estimate-text">Estimated Completion: {calculateSavingsEstimate()}</span>
            </div>

            <div className="savings-actions">
              <button className="btn-secondary flex-1" onClick={onOpenSavingsModal}>
                <Plus size={16} /> Add / Remove
              </button>
              <button
                className="btn-icon"
                onClick={() => setSavingsHistoryExpanded(!savingsHistoryExpanded)}
                title="Toggle History"
              >
                {savingsHistoryExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            {/* Expanded History */}
            {savingsHistoryExpanded && savings.history && (
              <div className="savings-history-list">
                <span className="history-header">Transaction History</span>
                {savings.history.length === 0 ? (
                  <span className="no-history-text">No transactions recorded yet.</span>
                ) : (
                  savings.history.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="history-row">
                      <div className="history-left">
                        {tx.type === 'add' ? (
                          <ArrowUpRight size={16} className="text-emerald" />
                        ) : (
                          <ArrowDownRight size={16} className="text-rose" />
                        )}
                        <span>{tx.note || (tx.type === 'add' ? 'Added Money' : 'Removed Money')}</span>
                      </div>
                      <span className={tx.type === 'add' ? 'text-emerald' : 'text-rose'}>
                        {tx.type === 'add' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 10. Sleep Tracker (Placed at the bottom of Home) */}
      <div className="dashboard-section sleep-section-bottom">
        <div className="section-header">
          <div className="section-title-group">
            <Moon size={18} className="text-indigo" />
            <h3 className="section-title">Sleep Tracker</h3>
          </div>
          <button className="text-action-btn" onClick={onOpenSleepModal}>
            Log Sleep
          </button>
        </div>

        {sleepRecords.length === 0 ? (
          <EmptyState
            icon={Moon}
            title="No sleep records yet."
            subtitle="Track your sleep duration and sleep quality every night."
            actionLabel="Log Sleep"
            onAction={onOpenSleepModal}
          />
        ) : (
          <div className="glass-card sleep-tracker-card">
            {/* Collapsed State */}
            <div
              className="sleep-collapsed-row"
              onClick={() => setSleepExpanded(!sleepExpanded)}
            >
              <div className="sleep-collapsed-info">
                <span className="sleep-duration-val">{latestSleep.durationHours} hours</span>
                <span className="sleep-quality-badge">{getSleepQualityLabel(latestSleep.quality)}</span>
              </div>
              <button className="btn-icon">
                {sleepExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            {/* Expanded State */}
            {sleepExpanded && (
              <div className="sleep-expanded-content">
                <div className="sleep-metrics-grid">
                  <div className="sleep-metric-box">
                    <span className="metric-lbl">Bedtime</span>
                    <span className="metric-val">{latestSleep.bedtime}</span>
                  </div>
                  <div className="sleep-metric-box">
                    <span className="metric-lbl">Wake-up Time</span>
                    <span className="metric-val">{latestSleep.wakeTime}</span>
                  </div>
                  <div className="sleep-metric-box">
                    <span className="metric-lbl">Goal</span>
                    <span className="metric-val">{state.sleep.targetHours || 8}h</span>
                  </div>
                  <div className="sleep-metric-box">
                    <span className="metric-lbl">Weekly Avg</span>
                    <span className="metric-val">
                      {(
                        sleepRecords.slice(0, 7).reduce((acc, s) => acc + s.durationHours, 0) /
                        Math.max(1, sleepRecords.slice(0, 7).length)
                      ).toFixed(1)}
                      h
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .home-dashboard {
          padding: 1rem 1.25rem 2rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .dashboard-section {
          display: flex;
          flex-direction: column;
        }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        .section-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .section-title {
          font-size: 1.05rem;
          font-weight: 700;
        }
        .section-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent-primary);
          font-weight: 700;
        }
        .card-title {
          font-size: 1.2rem;
          font-weight: 700;
        }
        .card-subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }
        .progress-overview-card {
          background: linear-gradient(135deg, rgba(30, 27, 75, 0.6) 0%, rgba(18, 21, 30, 0.8) 100%);
          border-color: rgba(99, 102, 241, 0.25);
        }
        .progress-overview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .priority-icon { color: var(--accent-rose); }
        .text-action-btn {
          color: var(--accent-primary);
          font-size: 0.8rem;
          font-weight: 600;
        }
        .compact-empty {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
          color: var(--text-muted);
          padding: 0.85rem 1rem;
        }
        .priority-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .priority-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem;
          border-left: 3px solid var(--accent-rose);
        }
        .priority-info {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .priority-task-title {
          font-size: 0.925rem;
          font-weight: 600;
        }
        .priority-meta {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .meta-time {
          font-size: 0.725rem;
          color: var(--text-subtle);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .tasks-compact-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .task-item-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
        }
        .task-item-row.completed {
          opacity: 0.6;
        }
        .task-row-details {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .task-title-text {
          font-size: 0.9rem;
          font-weight: 600;
        }
        .task-title-text.line-through {
          text-decoration: line-through;
        }
        .task-category-tag {
          font-size: 0.7rem;
          color: var(--text-subtle);
        }
        .upcoming-list {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }
        .upcoming-card {
          min-width: 160px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
        }
        .upcoming-date-badge {
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: var(--radius-md);
          padding: 0.4rem 0.65rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .up-day { font-size: 1.1rem; font-weight: 800; color: var(--accent-primary); line-height: 1; }
        .up-month { font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600; }
        .upcoming-info { display: flex; flex-direction: column; }
        .upcoming-title { font-size: 0.85rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90px; }
        .upcoming-cat { font-size: 0.7rem; color: var(--text-subtle); }
        .habits-quick-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        .habit-quick-card {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          cursor: pointer;
        }
        .habit-quick-card.done {
          border-color: rgba(245, 158, 11, 0.4);
          background: rgba(245, 158, 11, 0.08);
        }
        .habit-quick-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .streak-count { font-size: 0.725rem; font-weight: 700; color: var(--accent-amber); }
        .habit-quick-title { font-size: 0.875rem; font-weight: 600; }
        .quick-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }
        .stat-mini-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.85rem 0.5rem;
        }
        .stat-value { font-size: 1.25rem; font-weight: 800; color: var(--accent-primary); }
        .stat-label { font-size: 0.7rem; color: var(--text-subtle); font-weight: 600; }
        .savings-widget-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .savings-main {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .savings-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
        .savings-current { font-size: 1.75rem; font-weight: 800; color: var(--text-main); line-height: 1.1; margin: 0.2rem 0; }
        .savings-goal-target { font-size: 0.8rem; color: var(--text-subtle); }
        .savings-percent-badge {
          background: rgba(6, 182, 212, 0.15);
          border: 1px solid rgba(6, 182, 212, 0.3);
          color: var(--accent-cyan);
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius-full);
          font-weight: 800;
          font-size: 0.9rem;
        }
        .savings-progress-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          overflow: hidden;
        }
        .savings-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #06b6d4, #10b981);
          border-radius: 10px;
          transition: width 0.5s ease;
        }
        .savings-meta-row {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .savings-actions {
          display: flex;
          gap: 0.5rem;
        }
        .flex-1 { flex: 1; }
        .savings-history-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-subtle);
        }
        .history-header { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        .history-row { display: flex; align-items: center; justify-content: space-between; font-size: 0.825rem; }
        .history-left { display: flex; align-items: center; gap: 0.5rem; }
        .sleep-tracker-card {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .sleep-collapsed-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        }
        .sleep-duration-val { font-size: 1.35rem; font-weight: 800; color: var(--text-main); margin-right: 0.75rem; }
        .sleep-quality-badge {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
        }
        .sleep-expanded-content {
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-subtle);
        }
        .sleep-metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        .sleep-metric-box {
          background: var(--bg-surface-elevated);
          padding: 0.65rem;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
        }
        .metric-lbl { font-size: 0.7rem; color: var(--text-subtle); font-weight: 600; }
        .metric-val { font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-top: 0.1rem; }
      `}</style>
    </div>
  );
};

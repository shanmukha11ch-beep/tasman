import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Circle,
  Flame,
  Timer,
  PiggyBank,
  Moon,
  Zap,
  Award,
  TrendingUp,
  Plus,
  Edit2,
  Pause,
  Play,
  Archive,
  Trash2,
  Calendar,
  CheckSquare
} from 'lucide-react';
import { BarChartComponent, TrendChartComponent, ProgressRing } from '../components/Charts/SvgCharts';
import { EmptyState } from '../components/EmptyState';
import { storage } from '../utils/storage';

export const StatsView = ({ state, onOpenHabitModal, onEditHabit }) => {
  const [habitFilter, setHabitFilter] = useState('active'); // 'active' | 'paused' | 'archived' | 'all'
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Task Metrics
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter((t) => t.status === 'completed').length;
  const overallCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const todayTasks = state.tasks.filter((t) => t.dueDate === todayStr);

  // Weekly bar data calculation
  const getWeeklyTaskData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = state.tasks.filter((t) => t.dueDate === dateStr && t.status === 'completed').length;
      result.push({
        label: days[d.getDay()],
        value: count
      });
    }
    return result;
  };

  // Habit metrics & Filtering
  const habits = state.habits || [];
  const maxStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak || 0), 0) : 0;
  const longestStreakOverall = habits.length > 0 ? Math.max(...habits.map((h) => h.longestStreak || 0), 0) : 0;

  const filteredHabits = habits.filter((h) => {
    if (habitFilter === 'active') return h.status !== 'paused' && h.status !== 'archived';
    if (habitFilter === 'paused') return h.status === 'paused';
    if (habitFilter === 'archived') return h.status === 'archived';
    return true; // 'all'
  });

  // Focus time metrics
  const focusLogs = state.focusLogs || [];
  const totalFocusSeconds = focusLogs.reduce((acc, f) => acc + (f.durationSeconds || 0), 0);
  const totalFocusHours = (totalFocusSeconds / 3600).toFixed(1);

  // Sleep metrics
  const sleepRecords = state.sleep?.records || [];
  const avgSleep = sleepRecords.length > 0
    ? (sleepRecords.slice(0, 7).reduce((acc, s) => acc + s.durationHours, 0) / Math.min(7, sleepRecords.length)).toFixed(1)
    : 0;

  // Sleep trend data
  const sleepTrendData = sleepRecords.slice(0, 7).reverse().map((s) => ({
    label: new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' }),
    value: s.durationHours
  }));

  return (
    <div className="stats-view animate-fade-in">
      {/* Top Highlights Grid */}
      <div className="stats-highlight-grid">
        <div className="glass-card stat-big-card">
          <div className="stat-card-icon-glow text-emerald">
            <CheckCircle2 size={24} />
          </div>
          <span className="stat-big-val">{Math.round(overallCompletionRate)}%</span>
          <span className="stat-big-lbl">Completion Rate</span>
        </div>

        <div className="glass-card stat-big-card">
          <div className="stat-card-icon-glow text-amber">
            <Flame size={24} />
          </div>
          <span className="stat-big-val">{maxStreak}d</span>
          <span className="stat-big-lbl">Current Streak</span>
        </div>

        <div className="glass-card stat-big-card">
          <div className="stat-card-icon-glow text-indigo">
            <Timer size={24} />
          </div>
          <span className="stat-big-val">{totalFocusHours}h</span>
          <span className="stat-big-lbl">Total Focus</span>
        </div>

        <div className="glass-card stat-big-card">
          <div className="stat-card-icon-glow text-cyan">
            <Moon size={24} />
          </div>
          <span className="stat-big-val">{avgSleep}h</span>
          <span className="stat-big-lbl">Avg Sleep</span>
        </div>
      </div>

      {/* Habit Tracker Section */}
      <div className="glass-card habit-tracker-card">
        <div className="chart-header">
          <div className="chart-title-group">
            <Flame size={20} className="text-amber" />
            <h3 className="chart-title font-heading">Habit Tracker</h3>
          </div>
          <button className="btn-primary mini-btn" onClick={onOpenHabitModal}>
            <Plus size={16} /> New Habit
          </button>
        </div>

        {/* Filter Pills */}
        <div className="habit-filter-pills">
          <button
            className={`filter-pill ${habitFilter === 'active' ? 'active' : ''}`}
            onClick={() => setHabitFilter('active')}
          >
            Active ({habits.filter((h) => h.status !== 'paused' && h.status !== 'archived').length})
          </button>
          <button
            className={`filter-pill ${habitFilter === 'paused' ? 'active' : ''}`}
            onClick={() => setHabitFilter('paused')}
          >
            Paused ({habits.filter((h) => h.status === 'paused').length})
          </button>
          <button
            className={`filter-pill ${habitFilter === 'archived' ? 'active' : ''}`}
            onClick={() => setHabitFilter('archived')}
          >
            Archived ({habits.filter((h) => h.status === 'archived').length})
          </button>
          <button
            className={`filter-pill ${habitFilter === 'all' ? 'active' : ''}`}
            onClick={() => setHabitFilter('all')}
          >
            All ({habits.length})
          </button>
        </div>

        {/* Habits List */}
        {filteredHabits.length === 0 ? (
          <EmptyState
            icon={Flame}
            title="No habits found"
            subtitle={habits.length === 0 ? "Start tracking habits to build unstoppable streaks." : "No habits match this filter."}
            actionLabel="Add Habit"
            onAction={onOpenHabitModal}
          />
        ) : (
          <div className="habits-management-list">
            {filteredHabits.map((habit) => {
              const isCompletedToday = habit.completions && habit.completions[todayStr];
              const isPaused = habit.status === 'paused';
              const isArchived = habit.status === 'archived';

              return (
                <div key={habit.id} className={`glass-card habit-manage-item ${isCompletedToday ? 'completed' : ''}`}>
                  <button
                    className="check-btn"
                    onClick={() => storage.toggleHabitCompletion(habit.id, todayStr)}
                    disabled={isArchived}
                  >
                    {isCompletedToday ? (
                      <CheckCircle2 size={22} className="text-amber" />
                    ) : (
                      <Circle size={22} className="text-muted" />
                    )}
                  </button>

                  <div className="habit-manage-info">
                    <div className="habit-title-row">
                      <span className="habit-title-txt" style={habit.color ? { color: habit.color } : {}}>
                        {habit.title}
                      </span>
                      {isPaused && <span className="status-chip paused">Paused</span>}
                      {isArchived && <span className="status-chip archived">Archived</span>}
                    </div>

                    <div className="habit-meta-row">
                      <span className="habit-meta-chip">{habit.category || 'Health'}</span>
                      <span className="habit-meta-chip">
                        <Flame size={12} className="text-amber" /> {habit.streak || 0}d streak (Best: {habit.longestStreak || 0}d)
                      </span>
                      {habit.repeat?.frequency && (
                        <span className="habit-meta-chip">{habit.repeat.frequency}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="habit-item-actions">
                    <button
                      className="btn-icon mini-icon-btn"
                      onClick={() => onEditHabit(habit)}
                      title="Edit Habit"
                    >
                      <Edit2 size={15} />
                    </button>

                    {isPaused ? (
                      <button
                        className="btn-icon mini-icon-btn text-emerald"
                        onClick={() => storage.resumeHabit(habit.id)}
                        title="Resume Habit"
                      >
                        <Play size={15} />
                      </button>
                    ) : (
                      !isArchived && (
                        <button
                          className="btn-icon mini-icon-btn text-amber"
                          onClick={() => storage.pauseHabit(habit.id)}
                          title="Pause Habit"
                        >
                          <Pause size={15} />
                        </button>
                      )
                    )}

                    {!isArchived ? (
                      <button
                        className="btn-icon mini-icon-btn text-muted"
                        onClick={() => storage.archiveHabit(habit.id)}
                        title="Archive Habit"
                      >
                        <Archive size={15} />
                      </button>
                    ) : (
                      <button
                        className="btn-icon mini-icon-btn text-emerald"
                        onClick={() => storage.resumeHabit(habit.id)}
                        title="Restore Habit"
                      >
                        <Play size={15} />
                      </button>
                    )}

                    <button
                      className="btn-icon mini-icon-btn text-rose"
                      onClick={() => storage.deleteHabit(habit.id)}
                      title="Delete Habit"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Weekly Task Completion Chart */}
      <div className="glass-card chart-section-card">
        <div className="chart-header">
          <div className="chart-title-group">
            <BarChart3 size={18} className="text-primary" />
            <h3 className="chart-title font-heading">Weekly Task Completions</h3>
          </div>
          <span className="chart-badge">Last 7 Days</span>
        </div>

        <BarChartComponent data={getWeeklyTaskData()} height={180} />
      </div>

      {/* Sleep Trend Curve */}
      <div className="glass-card chart-section-card">
        <div className="chart-header">
          <div className="chart-title-group">
            <TrendingUp size={18} className="text-emerald" />
            <h3 className="chart-title font-heading">Sleep Duration Curve</h3>
          </div>
          <span className="chart-badge">Hours / Night</span>
        </div>

        <TrendChartComponent data={sleepTrendData} height={170} />
      </div>

      {/* Habit & Personal Bests Summary */}
      <div className="glass-card summary-card">
        <h3 className="chart-title mb-3 font-heading">Personal Productivity Bests</h3>
        <div className="bests-list">
          <div className="best-item">
            <Award size={18} className="text-amber" />
            <div className="best-info">
              <span className="best-lbl">Longest Habit Streak</span>
              <span className="best-val">{longestStreakOverall} Days</span>
            </div>
          </div>

          <div className="best-item">
            <Zap size={18} className="text-cyan" />
            <div className="best-info">
              <span className="best-lbl">Total Focus Sessions</span>
              <span className="best-val">{focusLogs.length} Sessions</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .stats-view {
          padding: 1rem 1.25rem 2rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .stats-highlight-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        .stat-big-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.25rem 0.85rem;
          text-align: center;
        }
        .stat-card-icon-glow {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }
        .stat-big-val { font-size: 1.5rem; font-weight: 800; color: var(--text-main); line-height: 1.1; }
        .stat-big-lbl { font-size: 0.725rem; color: var(--text-subtle); font-weight: 600; text-transform: uppercase; margin-top: 0.2rem; }
        
        .habit-tracker-card { display: flex; flex-direction: column; gap: 1rem; padding: 1.25rem; }
        .mini-btn { padding: 0.4rem 0.85rem; font-size: 0.75rem; display: flex; align-items: center; gap: 0.3rem; }
        .habit-filter-pills { display: flex; gap: 0.4rem; overflow-x: auto; }
        .filter-pill {
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
        }
        .filter-pill.active {
          background: var(--grad-primary);
          color: #fff;
          border-color: transparent;
        }
        .habits-management-list { display: flex; flex-direction: column; gap: 0.65rem; }
        .habit-manage-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem;
        }
        .habit-manage-item.completed { opacity: 0.75; }
        .habit-manage-info { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
        .habit-title-row { display: flex; align-items: center; gap: 0.5rem; }
        .habit-title-txt { font-size: 0.925rem; font-weight: 700; }
        .status-chip {
          font-size: 0.65rem;
          padding: 0.1rem 0.45rem;
          border-radius: var(--radius-full);
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-chip.paused { background: rgba(245, 158, 11, 0.15); color: var(--accent-amber); }
        .status-chip.archived { background: rgba(255, 255, 255, 0.1); color: var(--text-subtle); }
        .habit-meta-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
        .habit-meta-chip {
          font-size: 0.7rem;
          color: var(--text-subtle);
          background: var(--bg-surface-elevated);
          padding: 0.1rem 0.45rem;
          border-radius: var(--radius-sm);
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }
        .habit-item-actions { display: flex; gap: 0.25rem; }

        .chart-section-card { display: flex; flex-direction: column; gap: 1rem; padding: 1.25rem; }
        .chart-header { display: flex; align-items: center; justify-content: space-between; }
        .chart-title-group { display: flex; align-items: center; gap: 0.5rem; }
        .chart-title { font-size: 1.05rem; font-weight: 700; }
        .chart-badge {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-full);
          font-size: 0.7rem;
          font-weight: 600;
        }
        .summary-card { padding: 1.25rem; }
        .mb-3 { margin-bottom: 0.85rem; }
        .bests-list { display: flex; flex-direction: column; gap: 0.85rem; }
        .best-item { display: flex; align-items: center; gap: 0.85rem; background: var(--bg-surface-elevated); padding: 0.85rem; border-radius: var(--radius-md); }
        .best-info { display: flex; flex-direction: column; }
        .best-lbl { font-size: 0.75rem; color: var(--text-muted); }
        .best-val { font-size: 0.95rem; font-weight: 700; color: var(--text-main); }
      `}</style>
    </div>
  );
};


import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  Flame,
  Timer,
  PiggyBank,
  Moon,
  Zap,
  Award,
  TrendingUp
} from 'lucide-react';
import { BarChartComponent, TrendChartComponent, ProgressRing } from '../components/Charts/SvgCharts';

export const StatsView = ({ state }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Task Metrics
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter((t) => t.status === 'completed').length;
  const overallCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const todayTasks = state.tasks.filter((t) => t.dueDate === todayStr);
  const todayCompleted = todayTasks.filter((t) => t.status === 'completed').length;

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

  // Habit metrics
  const habits = state.habits || [];
  const maxStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak || 0), 0) : 0;
  const longestStreakOverall = habits.length > 0 ? Math.max(...habits.map((h) => h.longestStreak || 0), 0) : 0;

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

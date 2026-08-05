// TakMan Offline Data Store Engine
const STORAGE_KEY = 'TAKMAN_STORE_V1';

const INITIAL_DATA = {
  user: {
    name: 'Shanmukha',
    tagline: 'Plan Better. Do More.'
  },
  tasks: [],
  projects: [],
  habits: [],
  focusLogs: [],
  savings: {
    current: 0,
    goal: 0,
    goalTitle: '',
    targetDate: '',
    history: []
  },
  sleep: {
    records: [],
    targetHours: 8
  },
  settings: {
    theme: 'midnight-oled',
    notifications: false,
    soundEnabled: true
  }
};

class StorageEngine {
  constructor() {
    this.listeners = new Set();
    this.state = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return INITIAL_DATA;
      const parsed = JSON.parse(raw);
      // Merge with initial structure to avoid missing keys
      return {
        ...INITIAL_DATA,
        ...parsed,
        user: { ...INITIAL_DATA.user, ...parsed.user },
        savings: { ...INITIAL_DATA.savings, ...parsed.savings },
        sleep: { ...INITIAL_DATA.sleep, ...parsed.sleep },
        settings: { ...INITIAL_DATA.settings, ...parsed.settings }
      };
    } catch (e) {
      console.error('Failed to load TakMan storage:', e);
      return INITIAL_DATA;
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notify();
    } catch (e) {
      console.error('Failed to save TakMan storage:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  getState() {
    return this.state;
  }

  // --- TASKS ---
  addTask(taskData) {
    const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newTask = {
      id: taskId,
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      category: taskData.category || 'General',
      priority: taskData.priority || 'medium', // low, medium, high, urgent
      status: taskData.status || 'pending', // pending, in_progress, completed, archived
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      dueTime: taskData.dueTime || '12:00',
      tags: taskData.tags || [],
      notes: taskData.notes || '',
      subtasks: taskData.subtasks || [], // [{id, text, completed}]
      reminder: taskData.reminder || false,
      repeat: taskData.repeat || { frequency: 'never', weekdays: [], customDays: 1 },
      projectId: taskData.projectId || null,
      recurringSeriesId: taskData.recurringSeriesId || (taskData.repeat && taskData.repeat.frequency !== 'never' ? taskId : null),
      nextOccurrenceCreated: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    this.state.tasks.unshift(newTask);
    this.save();
    return newTask;
  }

  updateTask(id, updates) {
    const idx = this.state.tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.state.tasks[idx] = { ...this.state.tasks[idx], ...updates };
      this.save();
    }
  }

  deleteTask(id) {
    this.state.tasks = this.state.tasks.filter((t) => t.id !== id);
    this.save();
  }

  duplicateTask(id) {
    const original = this.state.tasks.find((t) => t.id === id);
    if (original) {
      const clone = {
        ...original,
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        title: `${original.title} (Copy)`,
        createdAt: new Date().toISOString(),
        completedAt: null,
        status: 'pending',
        nextOccurrenceCreated: false
      };
      this.state.tasks.unshift(clone);
      this.save();
    }
  }

  completeTask(id) {
    const task = this.state.tasks.find((t) => t.id === id);
    if (!task) return;

    if (task.status === 'completed') {
      // Toggle back to pending
      task.status = 'pending';
      task.completedAt = null;
    } else {
      task.status = 'completed';
      task.completedAt = new Date().toISOString();

      // Recurring Task Handling: Auto generate next occurrence ONCE if repeat is active!
      if (task.repeat && task.repeat.frequency !== 'never') {
        this.generateNextOccurrence(task);
      }
    }
    this.save();
  }

  skipOccurrence(id) {
    const task = this.state.tasks.find((t) => t.id === id);
    if (!task || !task.repeat || task.repeat.frequency === 'never') return;

    const currentDue = new Date(task.dueDate || new Date());
    const nextDate = this.calculateNextDate(currentDue, task.repeat);
    task.dueDate = nextDate.toISOString().split('T')[0];
    this.save();
  }

  generateNextOccurrence(task) {
    // 1. If this specific occurrence has already generated the next task, DO NOT generate another
    if (task.nextOccurrenceCreated) return;

    const currentDue = new Date(task.dueDate || new Date());
    const nextDate = this.calculateNextDate(currentDue, task.repeat);
    const nextDateStr = nextDate.toISOString().split('T')[0];
    const seriesId = task.recurringSeriesId || task.id;

    // 2. Check if a future occurrence in this series or from this parent task already exists
    const existing = this.state.tasks.find(
      (t) =>
        (t.recurringSeriesId === seriesId || t.parentTaskId === task.id) &&
        t.dueDate === nextDateStr &&
        t.status !== 'archived'
    );

    // Mark current task as having generated its next occurrence
    task.nextOccurrenceCreated = true;
    if (!task.recurringSeriesId) {
      task.recurringSeriesId = seriesId;
    }

    if (existing) return;

    // 3. Create the next occurrence
    const nextTask = {
      ...task,
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      recurringSeriesId: seriesId,
      parentTaskId: task.id,
      status: 'pending',
      completedAt: null,
      nextOccurrenceCreated: false,
      dueDate: nextDateStr,
      createdAt: new Date().toISOString()
    };
    this.state.tasks.unshift(nextTask);
  }

  calculateNextDate(currentDate, repeat) {
    const next = new Date(currentDate);
    const { frequency, weekdays = [], customDays = 1 } = repeat || {};

    if (frequency === 'daily') {
      next.setDate(next.getDate() + 1);
    } else if (frequency === 'weekly') {
      if (weekdays && weekdays.length > 0) {
        let currentDay = next.getDay();
        let daysToAdd = 1;
        for (let i = 1; i <= 7; i++) {
          let testDay = (currentDay + i) % 7;
          if (weekdays.includes(testDay)) {
            daysToAdd = i;
            break;
          }
        }
        next.setDate(next.getDate() + daysToAdd);
      } else {
        next.setDate(next.getDate() + 7);
      }
    } else if (frequency === 'monthly') {
      const origDay = next.getDate();
      next.setMonth(next.getMonth() + 1);
      if (next.getDate() !== origDay) {
        next.setDate(0); // Clamps to last day of previous month
      }
    } else if (frequency === 'yearly') {
      const origMonth = next.getMonth();
      next.setFullYear(next.getFullYear() + 1);
      if (next.getMonth() !== origMonth) {
        next.setDate(0);
      }
    } else if (frequency === 'custom') {
      const days = parseInt(customDays, 10) || 1;
      next.setDate(next.getDate() + Math.max(1, days));
    } else {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }

  // --- PROJECTS ---
  addProject(projectData) {
    const newProj = {
      id: 'proj_' + Date.now(),
      title: projectData.title,
      description: projectData.description || '',
      color: projectData.color || '#6366f1',
      category: projectData.category || 'General',
      createdAt: new Date().toISOString()
    };
    this.state.projects.unshift(newProj);
    this.save();
    return newProj;
  }

  updateProject(id, updates) {
    const idx = this.state.projects.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.state.projects[idx] = { ...this.state.projects[idx], ...updates };
      this.save();
    }
  }

  deleteProject(id) {
    this.state.projects = this.state.projects.filter((p) => p.id !== id);
    // Unassign tasks from deleted project
    this.state.tasks.forEach((t) => {
      if (t.projectId === id) t.projectId = null;
    });
    this.save();
  }

  // --- HABITS ---
  addHabit(habitData) {
    const newHabit = {
      id: 'habit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: habitData.title || 'Untitled Habit',
      category: habitData.category || 'Health',
      icon: habitData.icon || 'Flame',
      color: habitData.color || '#f59e0b',
      repeat: habitData.repeat || { frequency: 'daily', weekdays: [], customDays: 1 },
      reminder: habitData.reminder || { enabled: false, time: '08:00' },
      goal: habitData.goal || { target: 1, unit: 'times' },
      startDate: habitData.startDate || new Date().toISOString().split('T')[0],
      status: habitData.status || 'active', // 'active' | 'paused' | 'archived'
      streak: 0,
      longestStreak: 0,
      completions: {}, // { 'YYYY-MM-DD': true }
      createdAt: new Date().toISOString()
    };
    this.state.habits.unshift(newHabit);
    this.save();
    return newHabit;
  }

  updateHabit(id, updates) {
    const idx = this.state.habits.findIndex((h) => h.id === id);
    if (idx !== -1) {
      this.state.habits[idx] = { ...this.state.habits[idx], ...updates };
      this.calculateHabitStreak(this.state.habits[idx]);
      this.save();
    }
  }

  deleteHabit(id) {
    this.state.habits = this.state.habits.filter((h) => h.id !== id);
    this.save();
  }

  pauseHabit(id) {
    this.updateHabit(id, { status: 'paused' });
  }

  resumeHabit(id) {
    this.updateHabit(id, { status: 'active' });
  }

  archiveHabit(id) {
    this.updateHabit(id, { status: 'archived' });
  }

  toggleHabitCompletion(id, dateStr = new Date().toISOString().split('T')[0]) {
    const habit = this.state.habits.find((h) => h.id === id);
    if (!habit) return;

    if (!habit.completions) habit.completions = {};

    if (habit.completions[dateStr]) {
      delete habit.completions[dateStr];
    } else {
      habit.completions[dateStr] = true;
    }

    this.calculateHabitStreak(habit);
    this.save();
  }

  calculateHabitStreak(habit) {
    if (!habit || !habit.completions) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Determine start check point
    let currentCheck = new Date();
    let currentStr = todayStr;
    if (!habit.completions[todayStr]) {
      currentCheck = yesterday;
      currentStr = yesterdayStr;
    }

    if (!habit.completions[currentStr]) {
      habit.streak = 0;
    } else {
      let streak = 0;
      let checkDate = new Date(currentCheck);

      while (true) {
        const dateKey = checkDate.toISOString().split('T')[0];
        if (habit.completions[dateKey]) {
          streak++;
          const freq = habit.repeat?.frequency || 'daily';
          if (freq === 'daily') {
            checkDate.setDate(checkDate.getDate() - 1);
          } else if (freq === 'weekly') {
            checkDate.setDate(checkDate.getDate() - 7);
          } else if (freq === 'monthly') {
            checkDate.setMonth(checkDate.getMonth() - 1);
          } else if (freq === 'custom') {
            const step = parseInt(habit.repeat?.customDays, 10) || 1;
            checkDate.setDate(checkDate.getDate() - step);
          } else {
            checkDate.setDate(checkDate.getDate() - 1);
          }
        } else {
          break;
        }
      }
      habit.streak = streak;
    }

    if (habit.streak > (habit.longestStreak || 0)) {
      habit.longestStreak = habit.streak;
    }
  }

  // --- FOCUS ---
  logFocusSession(sessionData) {
    const log = {
      id: 'focus_' + Date.now(),
      mode: sessionData.mode, // pomodoro, shortBreak, longBreak
      durationSeconds: sessionData.durationSeconds,
      category: sessionData.category || 'General',
      taskTitle: sessionData.taskTitle || 'Focus Session',
      completedAt: new Date().toISOString()
    };
    this.state.focusLogs.unshift(log);
    this.save();
  }

  // --- SAVINGS WIDGET ---
  setSavingsGoal(goalAmount, goalTitle = '', targetDate = '') {
    this.state.savings.goal = parseFloat(goalAmount) || 0;
    this.state.savings.goalTitle = goalTitle;
    this.state.savings.targetDate = targetDate;
    this.save();
  }

  addSavingsMoney(amount, note = '') {
    const num = parseFloat(amount) || 0;
    if (num <= 0) return;

    this.state.savings.current = (this.state.savings.current || 0) + num;
    this.state.savings.history.unshift({
      id: 'tx_' + Date.now(),
      type: 'add',
      amount: num,
      note: note || 'Added money',
      date: new Date().toISOString()
    });
    this.save();
  }

  removeSavingsMoney(amount, note = '') {
    const num = parseFloat(amount) || 0;
    if (num <= 0) return;

    this.state.savings.current = Math.max(0, (this.state.savings.current || 0) - num);
    this.state.savings.history.unshift({
      id: 'tx_' + Date.now(),
      type: 'remove',
      amount: num,
      note: note || 'Removed money',
      date: new Date().toISOString()
    });
    this.save();
  }

  // --- SLEEP TRACKER ---
  addSleepRecord(record) {
    const newRecord = {
      id: 'sleep_' + Date.now(),
      date: record.date || new Date().toISOString().split('T')[0],
      bedtime: record.bedtime || '23:00',
      wakeTime: record.wakeTime || '07:00',
      durationHours: parseFloat(record.durationHours) || 8,
      quality: record.quality || 'Good' // Great, Good, Fair, Poor
    };
    this.state.sleep.records.unshift(newRecord);
    this.save();
  }

  deleteSleepRecord(id) {
    this.state.sleep.records = this.state.sleep.records.filter((s) => s.id !== id);
    this.save();
  }

  // --- SETTINGS & BACKUP ---
  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.save();
  }

  exportData() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `takman_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        this.state = {
          ...INITIAL_DATA,
          ...parsed
        };
        this.save();
        return { success: true };
      }
      return { success: false, error: 'Invalid JSON format' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  resetData() {
    this.state = { ...INITIAL_DATA };
    this.save();
  }
}

export const storage = new StorageEngine();

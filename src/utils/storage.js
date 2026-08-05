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
    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
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
        status: 'pending'
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

      // Recurring Task Handling: Auto generate next occurrence if repeat is active!
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
    const currentDue = new Date(task.dueDate || new Date());
    const nextDate = this.calculateNextDate(currentDue, task.repeat);

    const nextTask = {
      ...task,
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      status: 'pending',
      completedAt: null,
      dueDate: nextDate.toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    this.state.tasks.unshift(nextTask);
  }

  calculateNextDate(currentDate, repeat) {
    const next = new Date(currentDate);
    const { frequency, weekdays = [], customDays = 1 } = repeat;

    if (frequency === 'daily') {
      next.setDate(next.getDate() + 1);
    } else if (frequency === 'weekly') {
      if (weekdays.length > 0) {
        // Find next selected day of week
        let currentDay = next.getDay(); // 0 = Sun, 1 = Mon ...
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
      next.setMonth(next.getMonth() + 1);
    } else if (frequency === 'yearly') {
      next.setFullYear(next.getFullYear() + 1);
    } else if (frequency === 'custom') {
      next.setDate(next.getDate() + (parseInt(customDays, 10) || 1));
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
      id: 'habit_' + Date.now(),
      title: habitData.title,
      category: habitData.category || 'Health',
      icon: habitData.icon || 'Flame',
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
      this.save();
    }
  }

  deleteHabit(id) {
    this.state.habits = this.state.habits.filter((h) => h.id !== id);
    this.save();
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

    // Recalculate streak
    this.calculateHabitStreak(habit);
    this.save();
  }

  calculateHabitStreak(habit) {
    const today = new Date();
    let streak = 0;
    let curr = new Date(today);

    // Check today or yesterday as start
    let dateKey = curr.toISOString().split('T')[0];
    if (!habit.completions[dateKey]) {
      curr.setDate(curr.getDate() - 1);
      dateKey = curr.toISOString().split('T')[0];
    }

    while (habit.completions[dateKey]) {
      streak++;
      curr.setDate(curr.getDate() - 1);
      dateKey = curr.toISOString().split('T')[0];
    }

    habit.streak = streak;
    if (streak > (habit.longestStreak || 0)) {
      habit.longestStreak = streak;
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

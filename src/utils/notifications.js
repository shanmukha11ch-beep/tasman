// Notification and Reminder Engine for TakMan (Stage 1)
import { storage } from './storage';

export const REMINDER_OPTIONS = [
  { value: 'none', label: 'No reminder', offset: 0 },
  { value: 'at_due', label: 'At due time', offset: 0 },
  { value: '5_min', label: '5 minutes before', offset: 5 },
  { value: '10_min', label: '10 minutes before', offset: 10 },
  { value: '15_min', label: '15 minutes before', offset: 15 },
  { value: '30_min', label: '30 minutes before', offset: 30 },
  { value: '1_hour', label: '1 hour before', offset: 60 }
];

export const getReminderOffset = (reminderType) => {
  const opt = REMINDER_OPTIONS.find((o) => o.value === reminderType);
  return opt ? opt.offset : 0;
};

class NotificationManager {
  constructor() {
    this.activeTimers = new Map(); // taskId -> timeoutId
  }

  isSupported() {
    return 'Notification' in window;
  }

  getPermissionStatus() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission; // 'granted', 'denied', or 'default'
  }

  async requestPermission() {
    if (!this.isSupported()) return 'unsupported';

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        storage.updateSettings({ notifications: true });
        this.syncAllReminders(storage.getState().tasks, storage.getState().settings);
      } else {
        storage.updateSettings({ notifications: false });
      }
      return permission;
    } catch (e) {
      console.error('Failed to request notification permission:', e);
      return this.getPermissionStatus();
    }
  }

  getTaskDueTimestamp(dueDateStr, dueTimeStr) {
    if (!dueDateStr) return null;
    const [year, month, day] = dueDateStr.split('-').map(Number);
    const timeParts = (dueTimeStr || '12:00').split(':').map(Number);
    const hours = timeParts[0] || 0;
    const minutes = timeParts[1] || 0;
    const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return date.getTime();
  }

  cancelTaskReminder(taskId) {
    if (this.activeTimers.has(taskId)) {
      clearTimeout(this.activeTimers.get(taskId));
      this.activeTimers.delete(taskId);
    }
  }

  scheduleTaskReminder(task, settings) {
    if (!task || !task.id) return;

    // 1. Always clear existing timer for this task first (Duplicate Prevention)
    this.cancelTaskReminder(task.id);

    // 2. Check if notifications are enabled & permitted
    const isEnabled = settings?.notifications && this.getPermissionStatus() === 'granted';
    if (!isEnabled) return;

    // 3. Check task status & reminder setting
    if (task.status === 'completed' || task.status === 'archived') return;

    const reminderType = task.reminderType || (task.reminder ? 'at_due' : 'none');
    if (!reminderType || reminderType === 'none') return;

    const dueTimeMs = this.getTaskDueTimestamp(task.dueDate, task.dueTime);
    if (!dueTimeMs) return;

    const offsetMinutes = task.reminderOffset !== undefined ? task.reminderOffset : getReminderOffset(reminderType);
    const triggerTimeMs = dueTimeMs - offsetMinutes * 60 * 1000;
    const nowMs = Date.now();
    const delayMs = triggerTimeMs - nowMs;

    // 4. Schedule only if trigger time is in the future
    // JavaScript setTimeout limit is 2,147,483,647 ms (~24.8 days)
    if (delayMs > 0 && delayMs <= 2147483647) {
      const timerId = setTimeout(() => {
        this.triggerNotification(task);
        this.activeTimers.delete(task.id);
      }, delayMs);

      this.activeTimers.set(task.id, timerId);
    }
  }

  syncAllReminders(tasks = [], settings = {}) {
    // Clear all existing timers
    this.activeTimers.forEach((timerId) => clearTimeout(timerId));
    this.activeTimers.clear();

    const isEnabled = settings?.notifications && this.getPermissionStatus() === 'granted';
    if (!isEnabled || !Array.isArray(tasks)) return;

    tasks.forEach((task) => {
      this.scheduleTaskReminder(task, settings);
    });
  }

  triggerNotification(task) {
    if (this.getPermissionStatus() !== 'granted') return;

    const title = '📋 Task Reminder';
    const offsetMinutes = task.reminderOffset !== undefined ? task.reminderOffset : getReminderOffset(task.reminderType);

    let bodyText = `Task: ${task.title}`;
    if (offsetMinutes === 0) {
      bodyText = `"${task.title}" is due now`;
    } else if (offsetMinutes === 60) {
      bodyText = `"${task.title}" is due in 1 hour`;
    } else if (offsetMinutes > 0) {
      bodyText = `"${task.title}" is due in ${offsetMinutes} minutes`;
    } else {
      bodyText = `"${task.title}" starting soon`;
    }

    try {
      new Notification(title, {
        body: bodyText,
        tag: `task-reminder-${task.id}`,
        renotify: true
      });
    } catch (e) {
      console.error('Failed to trigger notification:', e);
    }
  }
}

export const notifications = new NotificationManager();

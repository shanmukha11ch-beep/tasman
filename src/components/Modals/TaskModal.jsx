import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Repeat, Clock, Calendar, Tag, FolderKanban, Bell } from 'lucide-react';
import { storage } from '../../utils/storage';
import { REMINDER_OPTIONS, getReminderOffset } from '../../utils/notifications';

export const TaskModal = ({ isOpen, onClose, initialTask = null, projects = [] }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Work');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('12:00');
  const [projectId, setProjectId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderType, setReminderType] = useState('none');

  // Subtasks
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  // Repeat config
  const [repeatFreq, setRepeatFreq] = useState('never'); // 'never' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  const [weekdays, setWeekdays] = useState([]); // [1, 3, 5]
  const [customDays, setCustomDays] = useState(1);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setCategory(initialTask.category || 'Work');
      setPriority(initialTask.priority || 'medium');
      setDueDate(initialTask.dueDate || new Date().toISOString().split('T')[0]);
      setDueTime(initialTask.dueTime || '12:00');
      setProjectId(initialTask.projectId || '');
      setTagsInput((initialTask.tags || []).join(', '));
      setNotes(initialTask.notes || '');
      setReminderType(initialTask.reminderType || (initialTask.reminder ? 'at_due' : 'none'));
      setSubtasks(initialTask.subtasks || []);
      if (initialTask.repeat) {
        setRepeatFreq(initialTask.repeat.frequency || 'never');
        setWeekdays(initialTask.repeat.weekdays || []);
        setCustomDays(initialTask.repeat.customDays || 1);
      }
    } else {
      // Reset defaults using user setting if available
      const defaultRem = storage.getState().settings?.defaultReminder || 'none';
      setTitle('');
      setDescription('');
      setCategory('Work');
      setPriority('medium');
      setDueDate(new Date().toISOString().split('T')[0]);
      setDueTime('12:00');
      setProjectId('');
      setTagsInput('');
      setNotes('');
      setReminderType(defaultRem);
      setSubtasks([]);
      setRepeatFreq('never');
      setWeekdays([]);
      setCustomDays(1);
    }
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: 'st_' + Date.now(), text: newSubtaskText.trim(), completed: false }
    ]);
    setNewSubtaskText('');
  };

  const handleRemoveSubtask = (stId) => {
    setSubtasks(subtasks.filter((st) => st.id !== stId));
  };

  const toggleWeekday = (dayNum) => {
    if (weekdays.includes(dayNum)) {
      setWeekdays(weekdays.filter((d) => d !== dayNum));
    } else {
      setWeekdays([...weekdays, dayNum].sort());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagsInput
      ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const reminderOffset = getReminderOffset(reminderType);
    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate,
      dueTime,
      projectId: projectId || null,
      tags: parsedTags,
      notes: notes.trim(),
      reminder: reminderType !== 'none',
      reminderType,
      reminderOffset,
      subtasks,
      repeat: {
        frequency: repeatFreq,
        weekdays,
        customDays
      }
    };

    if (initialTask) {
      storage.updateTask(initialTask.id, taskPayload);
    } else {
      storage.addTask(taskPayload);
    }

    onClose();
  };

  const categories = ['Work', 'Personal', 'Health', 'Finance', 'Learning', 'General'];
  const weekdayNames = [
    { num: 1, label: 'Mon' },
    { num: 2, label: 'Tue' },
    { num: 3, label: 'Wed' },
    { num: 4, label: 'Thu' },
    { num: 5, label: 'Fri' },
    { num: 6, label: 'Sat' },
    { num: 0, label: 'Sun' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <h3 className="modal-title font-heading">
            {initialTask ? 'Edit Task' : 'Create Task'}
          </h3>
          <button className="btn-icon mini-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form-body">
          {/* Title */}
          <div className="form-group">
            <label>Task Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Complete quarterly report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-textarea"
              placeholder="Add details, links, or context..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Row 1: Category & Priority */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group flex-1">
              <label>Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Row 2: Date & Time */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Due Date</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-group flex-1">
              <label>Due Time</label>
              <input
                type="time"
                className="form-input"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>

          {/* Project Assignment */}
          <div className="form-group">
            <label>Assign to Project</label>
            <select
              className="form-select"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">No Project (Independent)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Reminder Field */}
          <div className="form-group">
            <label className="label-with-icon">
              <Bell size={14} /> Reminder
            </label>
            <select
              className="form-select"
              value={reminderType}
              onChange={(e) => setReminderType(e.target.value)}
            >
              {REMINDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Recurring Task Settings */}
          <div className="form-group repeat-group-box">
            <label className="label-with-icon">
              <Repeat size={14} /> Recurring Settings
            </label>
            <select
              className="form-select"
              value={repeatFreq}
              onChange={(e) => setRepeatFreq(e.target.value)}
            >
              <option value="never">Never (One-time task)</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom Interval</option>
            </select>

            {/* Weekdays Multi-select */}
            {repeatFreq === 'weekly' && (
              <div className="weekdays-selector">
                <span className="sublabel">Repeat on weekdays:</span>
                <div className="weekdays-chips font-heading">
                  {weekdayNames.map((w) => {
                    const isSelected = weekdays.includes(w.num);
                    return (
                      <button
                        type="button"
                        key={w.num}
                        className={`day-chip ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleWeekday(w.num)}
                      >
                        {w.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Interval */}
            {repeatFreq === 'custom' && (
              <div className="custom-days-input">
                <span className="sublabel">Repeat every (days):</span>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="365"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Subtasks Checklist */}
          <div className="form-group">
            <label>Subtasks</label>
            <div className="subtask-add-row">
              <input
                type="text"
                className="form-input"
                placeholder="Add subtask step..."
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={handleAddSubtask}
              >
                <Plus size={16} /> Add
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="subtasks-preview-list">
                {subtasks.map((st) => (
                  <div key={st.id} className="subtask-preview-item">
                    <span>{st.text}</span>
                    <button
                      type="button"
                      className="btn-icon mini-icon-btn text-rose"
                      onClick={() => handleRemoveSubtask(st.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags & Notes */}
          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="urgent, report, client"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              className="form-textarea"
              placeholder="Additional notes..."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary modal-submit-btn">
            {initialTask ? 'Save Changes' : 'Create Task'}
          </button>
        </form>
      </div>

      <style>{`
        .modal-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .modal-title { font-size: 1.15rem; font-weight: 700; }
        .task-form-body { display: flex; flex-direction: column; gap: 0.85rem; }
        .form-row { display: flex; gap: 0.75rem; }
        .flex-1 { flex: 1; }
        .repeat-group-box {
          background: var(--bg-surface-elevated);
          padding: 0.85rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }
        .label-with-icon { display: flex; align-items: center; gap: 0.4rem; color: var(--accent-primary); }
        .weekdays-selector { display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; }
        .sublabel { font-size: 0.75rem; color: var(--text-muted); }
        .weekdays-chips { display: flex; gap: 0.35rem; }
        .day-chip {
          flex: 1;
          padding: 0.4rem 0.2rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
        }
        .day-chip.selected {
          background: var(--grad-primary);
          color: #fff;
          border-color: transparent;
        }
        .subtask-add-row { display: flex; gap: 0.5rem; }
        .subtasks-preview-list { display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; }
        .subtask-preview-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-surface-elevated);
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.825rem;
        }
        .modal-submit-btn { width: 100%; padding: 0.85rem; margin-top: 0.5rem; }
      `}</style>
    </div>
  );
};

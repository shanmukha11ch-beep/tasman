import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Circle,
  Copy,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Repeat,
  FolderPlus,
  SkipForward,
  Archive,
  ChevronRight,
  ListTodo,
  FolderKanban,
  Tag,
  CheckSquare
} from 'lucide-react';
import { storage } from '../utils/storage';
import { EmptyState } from '../components/EmptyState';

export const TasksView = ({ state, onOpenTaskModal, onEditTask, onOpenProjectModal }) => {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'projects'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active'); // 'active' | 'completed' | 'archived' | 'all'
  const [sortBy, setSortBy] = useState('dueDate'); // 'dueDate' | 'priority' | 'title' | 'createdAt'
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  // Subtask toggle inside list
  const handleToggleSubtask = (taskId, subtaskId) => {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task || !task.subtasks) return;

    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    storage.updateTask(taskId, { subtasks: updatedSubtasks });
  };

  // Filter & Search Logic
  const filteredTasks = state.tasks.filter((task) => {
    // Tab/Status Filter
    if (filterStatus === 'active' && (task.status === 'completed' || task.status === 'archived')) return false;
    if (filterStatus === 'completed' && task.status !== 'completed') return false;
    if (filterStatus === 'archived' && task.status !== 'archived') return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = (task.description || '').toLowerCase().includes(q);
      const matchTag = (task.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    // Category
    if (filterCategory !== 'all' && task.category !== filterCategory) return false;

    // Priority
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

    return true;
  });

  // Sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return (a.dueDate || '').localeCompare(b.dueDate || '');
    }
    if (sortBy === 'priority') {
      const pOrder = { urgent: 1, high: 2, medium: 3, low: 4 };
      return (pOrder[a.priority] || 9) - (pOrder[b.priority] || 9);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'createdAt') {
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    }
    return 0;
  });

  const categories = ['Work', 'Personal', 'Health', 'Finance', 'Learning', 'General'];

  return (
    <div className="tasks-view animate-fade-in">
      {/* Top Toggle & Add Bar */}
      <div className="tasks-header-row">
        <div className="tab-pill-group">
          <button
            className={`tab-pill ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <ListTodo size={16} /> Tasks ({state.tasks.length})
          </button>
          <button
            className={`tab-pill ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <FolderKanban size={16} /> Projects ({state.projects.length})
          </button>
        </div>

        {activeTab === 'tasks' ? (
          <button className="btn-primary add-task-btn" onClick={onOpenTaskModal}>
            <Plus size={18} /> New Task
          </button>
        ) : (
          <button className="btn-primary add-task-btn" onClick={onOpenProjectModal}>
            <FolderPlus size={18} /> New Project
          </button>
        )}
      </div>

      {activeTab === 'tasks' ? (
        <>
          {/* Search & Filter Controls */}
          <div className="glass-card controls-card">
            <div className="search-input-box">
              <Search size={18} className="text-muted" />
              <input
                type="text"
                className="search-field"
                placeholder="Search tasks, notes, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-chips-row">
              <div className="filter-item">
                <select
                  className="filter-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="active">Active Tasks</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                  <option value="all">All Statuses</option>
                </select>
              </div>

              <div className="filter-item">
                <select
                  className="filter-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <select
                  className="filter-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="dueDate">Sort by Due Date</option>
                  <option value="priority">Sort by Priority</option>
                  <option value="title">Sort by Title</option>
                  <option value="createdAt">Sort by Date Created</option>
                </select>
              </div>
            </div>
          </div>

          {/* Task List */}
          {sortedTasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No tasks found."
              subtitle={searchQuery ? 'No tasks match your search or filter options.' : 'Create your first task.'}
              actionLabel="Create Task"
              onAction={onOpenTaskModal}
            />
          ) : (
            <div className="tasks-main-list">
              {sortedTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                const isExpanded = expandedTaskId === task.id;
                const subtasks = task.subtasks || [];
                const completedSubtasksCount = subtasks.filter((s) => s.completed).length;

                return (
                  <div
                    key={task.id}
                    className={`glass-card task-card ${isCompleted ? 'task-completed' : ''}`}
                  >
                    <div className="task-card-main">
                      <button
                        className="check-btn"
                        onClick={() => storage.completeTask(task.id)}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={22} className="text-emerald" />
                        ) : (
                          <Circle size={22} className="text-muted" />
                        )}
                      </button>

                      <div
                        className="task-content-area"
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                      >
                        <h4 className={`task-card-title ${isCompleted ? 'strikethrough' : ''}`}>
                          {task.title}
                        </h4>

                        <div className="task-badges-row">
                          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                          <span className="task-cat-chip">{task.category}</span>
                          {task.repeat && task.repeat.frequency !== 'never' && (
                            <span className="repeat-chip">
                              <Repeat size={12} /> {task.repeat.frequency}
                            </span>
                          )}
                          {subtasks.length > 0 && (
                            <span className="subtasks-chip">
                              {completedSubtasksCount}/{subtasks.length} subtasks
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Action Icons */}
                      <div className="task-row-actions">
                        {task.repeat && task.repeat.frequency !== 'never' && !isCompleted && (
                          <button
                            className="btn-icon mini-icon-btn text-cyan"
                            onClick={() => storage.skipOccurrence(task.id)}
                            title="Skip this occurrence"
                          >
                            <SkipForward size={16} />
                          </button>
                        )}
                        <button
                          className="btn-icon mini-icon-btn"
                          onClick={() => onEditTask(task)}
                          title="Edit Task"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Task Metadata Row */}
                    <div className="task-footer-meta">
                      <span className="meta-item">
                        <Calendar size={13} /> {task.dueDate || 'No Date'}
                      </span>
                      {task.dueTime && (
                        <span className="meta-item">
                          <Clock size={13} /> {task.dueTime}
                        </span>
                      )}
                    </div>

                    {/* Expanded Drawer */}
                    {isExpanded && (
                      <div className="task-expanded-drawer">
                        {task.description && (
                          <p className="task-desc">{task.description}</p>
                        )}

                        {/* Subtasks Checklist */}
                        {subtasks.length > 0 && (
                          <div className="subtasks-section">
                            <span className="subtasks-label">Checklist</span>
                            <div className="subtasks-list">
                              {subtasks.map((st) => (
                                <div
                                  key={st.id}
                                  className="subtask-row"
                                  onClick={() => handleToggleSubtask(task.id, st.id)}
                                >
                                  {st.completed ? (
                                    <CheckCircle2 size={16} className="text-emerald" />
                                  ) : (
                                    <Circle size={16} className="text-muted" />
                                  )}
                                  <span className={st.completed ? 'line-through' : ''}>
                                    {st.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="drawer-actions-bar">
                          <button
                            className="btn-secondary mini-btn"
                            onClick={() => storage.duplicateTask(task.id)}
                          >
                            <Copy size={14} /> Duplicate
                          </button>
                          <button
                            className="btn-secondary mini-btn text-rose"
                            onClick={() => storage.deleteTask(task.id)}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* PROJECTS MODULE */
        <div className="projects-section">
          {state.projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects yet."
              subtitle="Group related tasks into projects and track complete progress."
              actionLabel="Create Project"
              onAction={onOpenProjectModal}
            />
          ) : (
            <div className="projects-grid">
              {state.projects.map((proj) => {
                const projTasks = state.tasks.filter((t) => t.projectId === proj.id);
                const doneCount = projTasks.filter((t) => t.status === 'completed').length;
                const percent = projTasks.length > 0 ? (doneCount / projTasks.length) * 100 : 0;

                return (
                  <div key={proj.id} className="glass-card project-card">
                    <div className="project-card-header">
                      <div className="project-title-group">
                        <div
                          className="project-color-dot"
                          style={{ backgroundColor: proj.color || '#6366f1' }}
                        />
                        <h4 className="project-title">{proj.title}</h4>
                      </div>
                      <button
                        className="btn-icon mini-icon-btn text-rose"
                        onClick={() => storage.deleteProject(proj.id)}
                        title="Delete project"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {proj.description && (
                      <p className="project-desc">{proj.description}</p>
                    )}

                    <div className="project-progress-area">
                      <div className="project-progress-meta">
                        <span>{doneCount} of {projTasks.length} tasks completed</span>
                        <span className="percent-txt">{Math.round(percent)}%</span>
                      </div>
                      <div className="project-bar">
                        <div
                          className="project-fill"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: proj.color || '#6366f1'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        .tasks-view {
          padding: 1rem 1.25rem 2rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .tasks-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .tab-pill-group {
          display: flex;
          background: var(--bg-surface-elevated);
          padding: 0.25rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
        }
        .tab-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
        }
        .tab-pill.active {
          background: var(--grad-primary);
          color: #fff;
        }
        .add-task-btn {
          padding: 0.5rem 1rem;
          font-size: 0.825rem;
        }
        .controls-card {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .search-input-box {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.6rem 0.85rem;
        }
        .search-field {
          width: 100%;
          background: none;
          border: none;
          color: var(--text-main);
          font-size: 0.9rem;
          outline: none;
        }
        .filter-chips-row {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
        }
        .filter-select {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          color: var(--text-muted);
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          outline: none;
        }
        .tasks-main-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .task-card {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          padding: 1rem;
          transition: all 0.2s;
        }
        .task-card.task-completed {
          opacity: 0.65;
        }
        .task-card-main {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .task-content-area {
          flex: 1;
          cursor: pointer;
        }
        .task-card-title {
          font-size: 0.975rem;
          font-weight: 600;
          line-height: 1.3;
          margin-bottom: 0.35rem;
        }
        .task-card-title.strikethrough { text-decoration: line-through; }
        .task-badges-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .task-cat-chip, .repeat-chip, .subtasks-chip {
          font-size: 0.7rem;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }
        .task-row-actions {
          display: flex;
          gap: 0.25rem;
        }
        .mini-icon-btn {
          width: 32px;
          height: 32px;
        }
        .task-footer-meta {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          font-size: 0.75rem;
          color: var(--text-subtle);
          padding-top: 0.4rem;
          border-top: 1px solid var(--border-subtle);
        }
        .meta-item { display: flex; align-items: center; gap: 0.3rem; }
        .task-expanded-drawer {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-top: 0.6rem;
          border-top: 1px dashed var(--border-subtle);
        }
        .task-desc { font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; }
        .subtasks-section { display: flex; flex-direction: column; gap: 0.4rem; }
        .subtasks-label { font-size: 0.725rem; font-weight: 700; color: var(--text-subtle); text-transform: uppercase; }
        .subtasks-list { display: flex; flex-direction: column; gap: 0.35rem; }
        .subtask-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .line-through { text-decoration: line-through; opacity: 0.7; }
        .drawer-actions-bar { display: flex; gap: 0.5rem; margin-top: 0.4rem; }
        .mini-btn { padding: 0.4rem 0.85rem; font-size: 0.75rem; }
        .text-rose { color: var(--accent-rose); }
        .text-cyan { color: var(--accent-cyan); }
        .text-emerald { color: var(--accent-emerald); }

        .projects-grid { display: flex; flex-direction: column; gap: 0.85rem; }
        .project-card { display: flex; flex-direction: column; gap: 0.75rem; }
        .project-card-header { display: flex; align-items: center; justify-content: space-between; }
        .project-title-group { display: flex; align-items: center; gap: 0.5rem; }
        .project-color-dot { width: 12px; height: 12px; border-radius: 50%; }
        .project-title { font-size: 1.05rem; font-weight: 700; }
        .project-desc { font-size: 0.825rem; color: var(--text-muted); }
        .project-progress-area { display: flex; flex-direction: column; gap: 0.4rem; }
        .project-progress-meta { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-subtle); }
        .percent-txt { font-weight: 700; color: var(--text-main); }
        .project-bar { height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: 10px; overflow: hidden; }
        .project-fill { height: 100%; border-radius: 10px; transition: width 0.4s ease; }
      `}</style>
    </div>
  );
};

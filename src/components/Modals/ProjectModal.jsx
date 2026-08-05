import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { storage } from '../../utils/storage';

export const ProjectModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    storage.addProject({
      title: title.trim(),
      description: description.trim(),
      color
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  const presetColors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <h3 className="modal-title font-heading">New Project</h3>
          <button className="btn-icon mini-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form-body">
          <div className="form-group">
            <label>Project Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Website Redesign"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-textarea"
              placeholder="Project goals & objectives..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Project Color Theme</label>
            <div className="color-preset-row">
              {presetColors.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`color-chip ${color === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary modal-submit-btn">
            Create Project
          </button>
        </form>
      </div>

      <style>{`
        .color-preset-row { display: flex; gap: 0.6rem; margin-top: 0.2rem; }
        .color-chip {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
        }
        .color-chip.active {
          border-color: #fff;
          transform: scale(1.15);
        }
      `}</style>
    </div>
  );
};

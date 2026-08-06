import React, { useState } from 'react';
import { storage } from '../../utils/storage';

export const Welcome = ({ onComplete }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      storage.setUserName(trimmed);
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="welcome-screen" style={styles.container}>
      <h2 style={styles.title}>Welcome to TakMan</h2>
      <p style={styles.text}>What should we call you?</p>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>Continue</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '400px',
    margin: '0 auto',
    textAlign: 'center',
    background: 'var(--bg-surface-elevated)',
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem'
  },
  text: {
    marginBottom: '1rem',
    color: 'var(--text-muted)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  input: {
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-subtle)',
    fontSize: '1rem'
  },
  button: {
    padding: '0.5rem 1rem',
    background: 'var(--grad-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer'
  }
};

import React, { useEffect, useState } from 'react';

export const Splash = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 500);
    }, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-logo-container">
        <div className="splash-icon">
          <svg viewBox="0 0 512 512" className="splash-svg">
            <rect width="512" height="512" rx="128" fill="#0b0e17"/>
            <path d="M 88 104 C 88 92.9 96.9 84 108 84 L 404 84 C 415.1 84 424 92.9 424 104 L 424 160 C 424 171.1 415.1 180 404 180 L 108 180 C 96.9 180 88 171.1 88 160 Z" fill="#8b5cf6"/>
            <path d="M 224 180 L 288 180 L 288 404 C 288 415.1 279.1 424 268 424 L 244 424 C 232.9 424 224 415.1 224 404 Z" fill="#8b5cf6"/>
            <path d="M 120 180 L 176 180 L 224 316 L 168 316 L 120 212 Z" fill="#6366f1"/>
            <path d="M 392 180 L 336 180 L 288 316 L 344 316 L 392 212 Z" fill="#6366f1"/>
          </svg>
        </div>
        <h1 className="splash-title text-gradient">TakMan</h1>
        <p className="splash-tagline">Plan Better. Do More.</p>
      </div>

      <style>{`
        .splash-screen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #0b0e17;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.5s ease-out;
        }
        .splash-screen.fade-out {
          opacity: 0;
          pointer-events: none;
        }
        .splash-logo-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: splashZoom 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes splashZoom {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        .splash-icon {
          width: 90px;
          height: 90px;
          margin-bottom: 1.25rem;
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }
        .splash-svg {
          width: 100%;
          height: 100%;
        }
        .splash-title {
          font-size: 2.25rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 0.35rem;
        }
        .splash-tagline {
          font-size: 0.9rem;
          color: var(--text-muted);
          font-weight: 500;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
};

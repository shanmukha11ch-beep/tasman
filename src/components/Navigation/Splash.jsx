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
            <defs>
              <linearGradient id="splashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
              <filter id="splashGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="16" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="512" height="512" rx="128" fill="#0f172a" />
            <g transform="translate(64, 64)">
              <path d="M 40 50 Q 192 40 344 50 C 364 51 364 80 344 80 L 40 80 C 20 80 20 50 40 50 Z" fill="url(#splashGrad)" />
              <path d="M 160 80 L 224 80 L 224 240 C 224 270 190 290 160 270 L 160 80 Z" fill="url(#splashGrad)" opacity="0.85" />
              <path d="M 120 220 L 190 290 L 340 140" fill="none" stroke="url(#splashGrad)" strokeWidth="42" strokeLinecap="round" strokeLinejoin="round" filter="url(#splashGlow)" />
            </g>
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
          background: #090a0f;
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

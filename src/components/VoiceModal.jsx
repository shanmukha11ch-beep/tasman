import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { voiceEngine } from '../utils/voiceEngine';

export const VoiceModal = ({ isOpen, onClose, onNavigate }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [manualText, setManualText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setFeedback(null);
      setManualText('');
      if (voiceEngine.isSupported()) {
        startVoice();
      }
    } else {
      voiceEngine.stopListening();
      setIsListening(false);
    }
  }, [isOpen]);

  const startVoice = () => {
    setIsListening(true);
    setFeedback(null);
    voiceEngine.startListening(
      (text, isFinal) => {
        setTranscript(text);
        if (isFinal && text) {
          handleExecute(text);
        }
      },
      (err) => {
        console.warn('Voice error:', err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const stopVoice = () => {
    voiceEngine.stopListening();
    setIsListening(false);
  };

  const handleExecute = (cmdText) => {
    if (!cmdText.trim()) return;
    const res = voiceEngine.parseAndExecute(cmdText);
    setFeedback(res);
    setIsListening(false);

    if (res.navigate && onNavigate) {
      setTimeout(() => {
        onNavigate(res.navigate);
        onClose();
      }, 1400);
    }
  };

  const handlePresetClick = (preset) => {
    setManualText(preset);
    handleExecute(preset);
  };

  if (!isOpen) return null;

  const sampleCommands = [
    "Add a task Prepare presentation",
    "Add ₹500 to savings",
    "Log my sleep",
    "Start focus session",
    "What should I do today?"
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content voice-modal" onClick={(e) => e.stopPropagation()}>
        <div className="voice-header">
          <div className="voice-title-group">
            <Sparkles className="sparkle-icon" size={20} />
            <h3 className="voice-title">Voice Assistant</h3>
          </div>
          <button className="btn-icon close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="voice-body">
          {/* Wave animation or Mic button */}
          <div className="mic-interactive-area">
            <button
              className={`mic-big-btn ${isListening ? 'listening' : ''}`}
              onClick={isListening ? stopVoice : startVoice}
            >
              {isListening ? <Mic size={32} /> : <MicOff size={32} />}
              {isListening && (
                <>
                  <div className="wave wave-1" />
                  <div className="wave wave-2" />
                </>
              )}
            </button>
            <p className="mic-status-text">
              {isListening ? 'Listening... Speak now' : 'Tap mic to start dictation'}
            </p>
          </div>

          {/* Transcript Display */}
          {(transcript || manualText) && (
            <div className="transcript-box">
              <span className="transcript-label">Recognized Speech:</span>
              <p className="transcript-text">"{transcript || manualText}"</p>
            </div>
          )}

          {/* Feedback Toast */}
          {feedback && (
            <div className="feedback-toast">
              <CheckCircle2 size={18} className="feedback-icon" />
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Manual Input Fallback */}
          <div className="manual-input-row">
            <input
              type="text"
              className="form-input"
              placeholder="Or type a voice command..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecute(manualText)}
            />
            <button
              className="btn-primary send-btn"
              onClick={() => handleExecute(manualText)}
            >
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Sample Preset Commands */}
          <div className="presets-section">
            <span className="presets-title">Try saying:</span>
            <div className="presets-chips">
              {sampleCommands.map((cmd, i) => (
                <button
                  key={i}
                  className="preset-chip"
                  onClick={() => handlePresetClick(cmd)}
                >
                  "{cmd}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .voice-modal {
          max-width: 440px;
        }
        .voice-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .voice-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .sparkle-icon {
          color: var(--accent-secondary);
        }
        .voice-title {
          font-size: 1.15rem;
          font-weight: 700;
        }
        .voice-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }
        .mic-interactive-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          margin: 0.5rem 0;
        }
        .mic-big-btn {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--grad-primary);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.4);
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .mic-big-btn.listening {
          transform: scale(1.05);
        }
        .wave {
          position: absolute;
          border: 2px solid var(--accent-primary);
          border-radius: 50%;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          animation: waveRipple 1.8s infinite ease-out;
          pointer-events: none;
        }
        .wave-2 {
          animation-delay: 0.6s;
        }
        @keyframes waveRipple {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .mic-status-text {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .transcript-box {
          width: 100%;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.85rem;
          text-align: left;
        }
        .transcript-label {
          font-size: 0.725rem;
          color: var(--text-subtle);
          font-weight: 600;
          text-transform: uppercase;
        }
        .transcript-text {
          font-size: 0.95rem;
          color: var(--text-main);
          font-weight: 500;
          margin-top: 0.2rem;
        }
        .feedback-toast {
          width: 100%;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34d399;
          padding: 0.75rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .manual-input-row {
          display: flex;
          gap: 0.5rem;
          width: 100%;
        }
        .send-btn {
          padding: 0.75rem 1rem;
        }
        .presets-section {
          width: 100%;
        }
        .presets-title {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          display: block;
          margin-bottom: 0.5rem;
        }
        .presets-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .preset-chip {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          transition: all 0.2s;
        }
        .preset-chip:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-main);
          border-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

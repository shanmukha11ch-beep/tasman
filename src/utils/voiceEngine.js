// Voice-to-Task Foundation Engine for TakMan
import { storage } from './storage';

export class VoiceEngine {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = SpeechRecognition ? new SpeechRecognition() : null;
    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  isSupported() {
    return !!this.recognition;
  }

  startListening(onResult, onError, onEnd) {
    if (!this.recognition) {
      if (onError) onError('Speech Recognition is not supported in this browser.');
      return;
    }

    this.recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (onResult) onResult(transcript, event.results[0].isFinal);
    };

    this.recognition.onerror = (event) => {
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Speech recognition start error:', e);
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  // Parse natural language command and return executed action feedback
  parseAndExecute(commandText) {
    const text = commandText.trim().toLowerCase();

    // 1. Savings Command: "Add ₹500 to savings" or "add 500 to savings" or "save 500"
    const savingsMatch = text.match(/(?:add|save|deposit)\s*(?:₹|rs|rupees)?\s*(\d+(?:\.\d+)?)\s*(?:to\s*savings|in\s*savings)?/i);
    if (savingsMatch && (text.includes('savings') || text.includes('save') || text.includes('deposit'))) {
      const amount = parseFloat(savingsMatch[1]);
      if (amount > 0) {
        storage.addSavingsMoney(amount, 'Voice command addition');
        return {
          type: 'SAVINGS',
          success: true,
          message: `Added ₹${amount} to your savings goal!`,
          navigate: 'home'
        };
      }
    }

    // 2. Focus Command: "Start focus session" or "start pomodoro"
    if (text.includes('focus') || text.includes('pomodoro') || text.includes('timer')) {
      return {
        type: 'FOCUS',
        success: true,
        message: 'Opening Focus Session timer!',
        navigate: 'focus'
      };
    }

    // 3. Sleep Command: "Log my sleep" or "log sleep"
    if (text.includes('sleep') || text.includes('bedtime')) {
      // Check if numbers mentioned (e.g. "slept 8 hours")
      const sleepHoursMatch = text.match(/(?:slept|sleep)\s*(\d+(?:\.\d+)?)\s*hours/i);
      const hours = sleepHoursMatch ? parseFloat(sleepHoursMatch[1]) : 8;
      storage.addSleepRecord({
        date: new Date().toISOString().split('T')[0],
        bedtime: '23:00',
        wakeTime: '07:00',
        durationHours: hours,
        quality: 'Good'
      });
      return {
        type: 'SLEEP',
        success: true,
        message: `Logged ${hours} hours of sleep!`,
        navigate: 'home'
      };
    }

    // 4. Query Command: "What should I do today?" or "today tasks"
    if (text.includes('what should i do') || text.includes('today tasks') || text.includes('priorities')) {
      const state = storage.getState();
      const todayStr = new Date().toISOString().split('T')[0];
      const todayTasks = state.tasks.filter((t) => t.dueDate === todayStr && t.status !== 'completed');
      
      const count = todayTasks.length;
      let msg = count === 0 ? "You have no pending tasks scheduled for today!" : `You have ${count} pending task${count > 1 ? 's' : ''} for today.`;
      return {
        type: 'QUERY',
        success: true,
        message: msg,
        navigate: 'tasks'
      };
    }

    // 5. Default Task Creation: "Add a task [title]" or "remind me to [title]"
    let taskTitle = text.replace(/^(?:add\s+a?\s*task|add\s+task|remind\s+me\s+to|create\s+task|new\s+task)\s*/i, '');
    if (!taskTitle) taskTitle = commandText;

    // Capitalize first letter
    taskTitle = taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1);

    const task = storage.addTask({
      title: taskTitle,
      category: 'General',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0]
    });

    return {
      type: 'TASK_CREATED',
      success: true,
      message: `Created task: "${task.title}"`,
      navigate: 'tasks'
    };
  }
}

export const voiceEngine = new VoiceEngine();

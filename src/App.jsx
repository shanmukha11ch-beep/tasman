import React, { useState, useEffect } from 'react';
import { Header } from './components/Navigation/Header';
import { BottomNav } from './components/Navigation/BottomNav';
import { Splash } from './components/Navigation/Splash';
import { VoiceModal } from './components/VoiceModal';

import { HomeView } from './views/HomeView';
import { TasksView } from './views/TasksView';
import { CalendarView } from './views/CalendarView';
import { FocusView } from './views/FocusView';
import { StatsView } from './views/StatsView';
import { ProfileView } from './views/ProfileView';

import { TaskModal } from './components/Modals/TaskModal';
import { ProjectModal } from './components/Modals/ProjectModal';
import { SavingsModal } from './components/Modals/SavingsModal';
import { SleepModal } from './components/Modals/SleepModal';
import { HabitModal } from './components/Modals/HabitModal';

import { storage } from './utils/storage';

export default function App() {
  const [state, setState] = useState(storage.getState());
  const [activeTab, setActiveTab] = useState('home');
  const [showSplash, setShowSplash] = useState(true);

  // Modals state
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Sync state with storage engine
  useEffect(() => {
    const unsubscribe = storage.subscribe((newState) => {
      setState({ ...newState });
    });
    return unsubscribe;
  }, []);

  // Apply theme to body
  useEffect(() => {
    if (state.settings?.theme) {
      document.body.setAttribute('data-theme', state.settings.theme);
    }
  }, [state.settings?.theme]);

  // Handlers
  const handleOpenNewTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenNewHabit = () => {
    setEditingHabit(null);
    setIsHabitModalOpen(true);
  };

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setIsHabitModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Splash Screen on initial boot */}
      {showSplash && <Splash onComplete={() => setShowSplash(false)} />}

      {/* Main Header */}
      <Header
        userName={state.user?.name || 'Shanmukha'}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onQuickAddTask={handleOpenNewTask}
      />

      {/* Primary View Routing */}
      <main className="app-main-content">
        {activeTab === 'home' && (
          <HomeView
            state={state}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenTaskModal={handleOpenNewTask}
            onOpenHabitModal={handleOpenNewHabit}
            onEditHabit={handleEditHabit}
            onOpenSavingsModal={() => setIsSavingsModalOpen(true)}
            onOpenSleepModal={() => setIsSleepModalOpen(true)}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            state={state}
            onOpenTaskModal={handleOpenNewTask}
            onEditTask={handleEditTask}
            onOpenProjectModal={() => setIsProjectModalOpen(true)}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            state={state}
            onOpenTaskModal={handleOpenNewTask}
          />
        )}

        {activeTab === 'focus' && (
          <FocusView state={state} />
        )}

        {activeTab === 'stats' && (
          <StatsView
            state={state}
            onOpenHabitModal={handleOpenNewHabit}
            onEditHabit={handleEditHabit}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            state={state}
            onOpenVoice={() => setIsVoiceOpen(true)}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
      />

      {/* Modals & Overlays */}
      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onNavigate={(tab) => setActiveTab(tab)}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        initialTask={editingTask}
        projects={state.projects}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />

      <SavingsModal
        isOpen={isSavingsModalOpen}
        onClose={() => setIsSavingsModalOpen(false)}
        savings={state.savings}
      />

      <SleepModal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
      />

      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        initialHabit={editingHabit}
      />

      <style>{`
        .app-main-content {
          flex: 1;
          width: 100%;
        }
      `}</style>
    </div>
  );
}

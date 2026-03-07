import React, { useState, useCallback } from 'react';
import type { TabId } from './types';
import { useAppState } from './hooks/useAppState';
import { defaultState } from './utils/storage';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { TaskManager } from './components/TaskManager';
import { HealthTracker } from './components/HealthTracker';
import { FocusTimer } from './components/FocusTimer';
import { Settings } from './components/Settings';

export default function App() {
  const {
    state, addTask, updateTask, deleteTask, completeTask, reorderTasks,
    getTodayLog, updateTodayLog, addBrainDump, deleteBrainDump, convertBrainDumpToTask,
    addFocusSession, updateSettings, logMedication,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const themeClass = state.settings.theme === 'dark' ? 'theme-dark' : 'theme-light';

  const handleClearData = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  return (
    <div className={`app-shell ${themeClass}`}>
      {/* Background orbs */}
      <div className="app-bg">
        <div className="app-orb orb-1" />
        <div className="app-orb orb-2" />
      </div>

      {/* Active Screen */}
      {activeTab === 'dashboard' && (
        <Dashboard state={state} onNavigate={setActiveTab} />
      )}

      {activeTab === 'tasks' && (
        <TaskManager
          tasks={state.tasks}
          brainDump={state.brainDump}
          onAddTask={addTask}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onCompleteTask={completeTask}
          onAddBrainDump={addBrainDump}
          onDeleteBrainDump={deleteBrainDump}
          onConvertBrainDump={convertBrainDumpToTask}
        />
      )}

      {activeTab === 'health' && (
        <HealthTracker
          state={state}
          onUpdateTodayLog={updateTodayLog}
          onLogMedication={logMedication}
          onUpdateSettings={updateSettings}
        />
      )}

      {activeTab === 'focus' && (
        <FocusTimer
          state={state}
          onAddFocusSession={addFocusSession}
          onUpdateSettings={updateSettings}
        />
      )}

      {activeTab === 'settings' && (
        <Settings
          settings={state.settings}
          onUpdateSettings={updateSettings}
          onClearData={handleClearData}
        />
      )}

      {/* Bottom Nav */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

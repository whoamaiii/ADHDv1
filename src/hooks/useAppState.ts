import { useState, useCallback, useEffect } from 'react';
import type { AppState, Task, DailyLog, BrainDumpEntry, FocusSession, UserSettings } from '../types';
import { loadState, saveState, getToday, generateId } from '../utils/storage';

export function useAppState() {
  const [state, setState] = useState<AppState>(loadState);

  // Auto-save on every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // ─── Task Operations ───
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'order'>) => {
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, { ...task, id: generateId(), createdAt: new Date().toISOString(), order: prev.tasks.length }],
    }));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  }, []);

  const completeTask = useCallback((id: string) => {
    const today = getToday();
    setState(prev => {
      const tasks = prev.tasks.map(t =>
        t.id === id ? { ...t, status: 'done' as const, completedAt: new Date().toISOString() } : t
      );
      const completedToday = tasks.filter(t => t.completedAt?.startsWith(today) && t.status === 'done').length;
      const isNewDay = prev.streaks.lastCompletedDate !== today;
      const isConsecutive = prev.streaks.lastCompletedDate === getPreviousDay(today);

      let currentStreak = prev.streaks.currentTaskStreak;
      if (isNewDay && completedToday >= 1) {
        currentStreak = isConsecutive ? currentStreak + 1 : 1;
      }

      return {
        ...prev,
        tasks,
        streaks: {
          ...prev.streaks,
          currentTaskStreak: currentStreak,
          longestTaskStreak: Math.max(prev.streaks.longestTaskStreak, currentStreak),
          lastCompletedDate: today,
        },
      };
    });
  }, []);

  const reorderTasks = useCallback((taskIds: string[]) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => ({ ...t, order: taskIds.indexOf(t.id) })).sort((a, b) => a.order - b.order),
    }));
  }, []);

  // ─── Daily Log Operations ───
  const getTodayLog = useCallback((): DailyLog | undefined => {
    return state.dailyLogs.find(l => l.date === getToday());
  }, [state.dailyLogs]);

  const updateTodayLog = useCallback((updates: Partial<DailyLog>) => {
    const today = getToday();
    setState(prev => {
      const existingIdx = prev.dailyLogs.findIndex(l => l.date === today);
      if (existingIdx >= 0) {
        const logs = [...prev.dailyLogs];
        logs[existingIdx] = { ...logs[existingIdx], ...updates };
        return { ...prev, dailyLogs: logs };
      }
      const newLog: DailyLog = {
        id: generateId(),
        date: today,
        mood: 3,
        energy: 3,
        sleepHours: 7,
        sleepQuality: 3,
        medications: [],
        water: 0,
        exercise: [],
        symptoms: [],
        ...updates,
      };
      return { ...prev, dailyLogs: [...prev.dailyLogs, newLog] };
    });
  }, []);

  // ─── Brain Dump Operations ───
  const addBrainDump = useCallback((text: string) => {
    setState(prev => ({
      ...prev,
      brainDump: [{ id: generateId(), text, createdAt: new Date().toISOString() }, ...prev.brainDump],
    }));
  }, []);

  const deleteBrainDump = useCallback((id: string) => {
    setState(prev => ({ ...prev, brainDump: prev.brainDump.filter(b => b.id !== id) }));
  }, []);

  const convertBrainDumpToTask = useCallback((id: string) => {
    const entry = state.brainDump.find(b => b.id === id);
    if (!entry) return;
    const taskId = generateId();
    setState(prev => ({
      ...prev,
      brainDump: prev.brainDump.map(b => b.id === id ? { ...b, convertedToTaskId: taskId } : b),
      tasks: [...prev.tasks, {
        id: taskId, title: entry.text, priority: 'medium', status: 'todo',
        category: 'personal', recurrence: 'none', subtasks: [],
        createdAt: new Date().toISOString(), order: prev.tasks.length,
      }],
    }));
  }, [state.brainDump]);

  // ─── Focus Session Operations ───
  const addFocusSession = useCallback((session: Omit<FocusSession, 'id'>) => {
    setState(prev => ({
      ...prev,
      focusSessions: [...prev.focusSessions, { ...session, id: generateId() }],
    }));
  }, []);

  // ─── Settings ───
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, ...updates } }));
  }, []);

  // ─── Medication ───
  const logMedication = useCallback((medicationId: string, scheduledTime: string, taken: boolean) => {
    const today = getToday();
    setState(prev => {
      const existingIdx = prev.dailyLogs.findIndex(l => l.date === today);
      const log = existingIdx >= 0 ? { ...prev.dailyLogs[existingIdx] } : {
        id: generateId(), date: today, mood: 3 as const, energy: 3 as const,
        sleepHours: 7, sleepQuality: 3 as const, medications: [], water: 0, exercise: [], symptoms: [],
      };

      const medIdx = log.medications.findIndex(m => m.medicationId === medicationId && m.scheduledTime === scheduledTime);
      if (medIdx >= 0) {
        log.medications = [...log.medications];
        log.medications[medIdx] = { ...log.medications[medIdx], taken, time: taken ? new Date().toISOString() : undefined };
      } else {
        log.medications = [...log.medications, { medicationId, taken, scheduledTime, time: taken ? new Date().toISOString() : undefined }];
      }

      const logs = existingIdx >= 0
        ? prev.dailyLogs.map((l, i) => i === existingIdx ? log : l)
        : [...prev.dailyLogs, log];

      // Update med streak
      const allMedsTaken = prev.settings.medications
        .filter(m => m.active)
        .every(m => m.times.every(t =>
          log.medications.some(ml => ml.medicationId === m.id && ml.scheduledTime === t && ml.taken)
        ));

      let medStreak = prev.streaks.currentMedStreak;
      if (allMedsTaken && prev.streaks.lastMedDate !== today) {
        const isConsecutive = prev.streaks.lastMedDate === getPreviousDay(today);
        medStreak = isConsecutive ? medStreak + 1 : 1;
      }

      return {
        ...prev,
        dailyLogs: logs,
        streaks: {
          ...prev.streaks,
          currentMedStreak: allMedsTaken ? medStreak : prev.streaks.currentMedStreak,
          lastMedDate: allMedsTaken ? today : prev.streaks.lastMedDate,
        },
      };
    });
  }, []);

  return {
    state,
    addTask, updateTask, deleteTask, completeTask, reorderTasks,
    getTodayLog, updateTodayLog,
    addBrainDump, deleteBrainDump, convertBrainDumpToTask,
    addFocusSession,
    updateSettings,
    logMedication,
  };
}

function getPreviousDay(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

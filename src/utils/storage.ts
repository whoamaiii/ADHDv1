import type { AppState, UserSettings, TimerSettings } from '../types';

const STORAGE_KEY = 'adhd-companion-state';

const defaultTimerSettings: TimerSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
};

const defaultSettings: UserSettings = {
  displayName: 'Meg',
  theme: 'dark',
  notifications: true,
  hapticFeedback: true,
  medications: [],
  timerSettings: defaultTimerSettings,
  dailyGoals: {
    tasks: 5,
    water: 8,
    exerciseMinutes: 30,
    focusMinutes: 120,
  },
  symptoms: [
    'Brain fog',
    'Restless',
    'Hyperfocus',
    'Procrastinating',
    'Anxious',
    'Irritable',
    'Scattered',
    'Overwhelmed',
    'Calm',
    'Productive',
  ],
};

export const defaultState: AppState = {
  tasks: [],
  dailyLogs: [],
  focusSessions: [],
  brainDump: [],
  settings: defaultSettings,
  streaks: {
    currentTaskStreak: 0,
    longestTaskStreak: 0,
    currentMedStreak: 0,
  },
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...defaultState,
      ...parsed,
      settings: { ...defaultSettings, ...parsed.settings },
    };
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error('Failed to save state');
  }
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('no-NO', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });
}

export function isToday(dateStr: string): boolean {
  return dateStr === getToday();
}

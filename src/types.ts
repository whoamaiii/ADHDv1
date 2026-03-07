// ─── Navigation ───
export type TabId = 'dashboard' | 'tasks' | 'health' | 'focus' | 'settings';

// ─── Tasks ───
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'skipped';
export type TaskCategory = 'work' | 'personal' | 'health' | 'home' | 'errands' | 'social' | 'creative';
export type RecurrenceType = 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'none';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  estimatedMinutes?: number;
  dueDate?: string;
  recurrence: RecurrenceType;
  subtasks: Subtask[];
  createdAt: string;
  completedAt?: string;
  order: number;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

// ─── Health ───
export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type SleepQuality = 1 | 2 | 3 | 4 | 5;

export interface DailyLog {
  id: string;
  date: string;
  mood: MoodLevel;
  energy: EnergyLevel;
  sleepHours: number;
  sleepQuality: SleepQuality;
  medications: MedicationLog[];
  water: number;
  exercise: ExerciseLog[];
  symptoms: string[];
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  active: boolean;
}

export interface MedicationLog {
  medicationId: string;
  taken: boolean;
  time?: string;
  scheduledTime: string;
}

export interface ExerciseLog {
  type: string;
  durationMinutes: number;
  intensity: 'light' | 'moderate' | 'intense';
}

// ─── Focus Timer ───
export type TimerMode = 'focus' | 'short_break' | 'long_break';

export interface TimerSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}

export interface FocusSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  mode: TimerMode;
  completedMinutes: number;
  taskId?: string;
}

// ─── Brain Dump ───
export interface BrainDumpEntry {
  id: string;
  text: string;
  createdAt: string;
  convertedToTaskId?: string;
}

// ─── Settings ───
export interface UserSettings {
  displayName: string;
  theme: 'dark' | 'light';
  notifications: boolean;
  hapticFeedback: boolean;
  medications: Medication[];
  timerSettings: TimerSettings;
  dailyGoals: {
    tasks: number;
    water: number;
    exerciseMinutes: number;
    focusMinutes: number;
  };
  symptoms: string[];
}

// ─── App State ───
export interface AppState {
  tasks: Task[];
  dailyLogs: DailyLog[];
  focusSessions: FocusSession[];
  brainDump: BrainDumpEntry[];
  settings: UserSettings;
  streaks: {
    currentTaskStreak: number;
    longestTaskStreak: number;
    currentMedStreak: number;
    lastCompletedDate?: string;
    lastMedDate?: string;
  };
}

import React, { useMemo } from 'react';
import type { AppState, TabId } from '../types';
import { getToday, formatDate } from '../utils/storage';
import { ZapIcon, FlameIcon, CheckIcon, DropletIcon, SparklesIcon, BrainIcon } from '../utils/icons';

interface Props {
  state: AppState;
  onNavigate: (tab: TabId) => void;
}

export const Dashboard: React.FC<Props> = ({ state, onNavigate }) => {
  const today = getToday();
  const todayLog = state.dailyLogs.find(l => l.date === today);
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return 'God natt';
    if (hour < 12) return 'God morgen';
    if (hour < 17) return 'God ettermiddag';
    return 'God kveld';
  }, []);

  const todayTasks = state.tasks.filter(t => t.status !== 'done' || t.completedAt?.startsWith(today));
  const completedToday = state.tasks.filter(t => t.status === 'done' && t.completedAt?.startsWith(today)).length;
  const pendingToday = state.tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length;
  const taskProgress = state.settings.dailyGoals.tasks > 0
    ? Math.min(100, Math.round((completedToday / state.settings.dailyGoals.tasks) * 100))
    : 0;

  const waterProgress = todayLog
    ? Math.min(100, Math.round((todayLog.water / state.settings.dailyGoals.water) * 100))
    : 0;

  const todayFocusMinutes = state.focusSessions
    .filter(s => s.startedAt.startsWith(today) && s.mode === 'focus')
    .reduce((sum, s) => sum + s.completedMinutes, 0);
  const focusProgress = Math.min(100, Math.round((todayFocusMinutes / state.settings.dailyGoals.focusMinutes) * 100));

  const activeMeds = state.settings.medications.filter(m => m.active);
  const totalMedDoses = activeMeds.reduce((s, m) => s + m.times.length, 0);
  const takenMedDoses = todayLog
    ? todayLog.medications.filter(m => m.taken).length
    : 0;
  const medProgress = totalMedDoses > 0 ? Math.min(100, Math.round((takenMedDoses / totalMedDoses) * 100)) : 100;

  const brainDumpCount = state.brainDump.filter(b => !b.convertedToTaskId).length;

  return (
    <div className="screen-content">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="pill pill-gold" style={{ marginBottom: 10 }}>
          <SparklesIcon /> {formatDate(today)}
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 7vw, 38px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 6 }}>
          {greeting}, {state.settings.displayName}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {pendingToday === 0 && completedToday > 0
            ? 'Alle oppgaver fullfort! Du er en boss.'
            : pendingToday === 0
              ? 'Ingen oppgaver enna. Legg til noen!'
              : `${pendingToday} oppgaver venter pa deg.`}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="stat-grid mb-lg">
        <button className="stat-item card-interactive" onClick={() => onNavigate('tasks')}>
          <div style={{ color: 'var(--gold-text)' }}><CheckIcon /></div>
          <div className="stat-value">{completedToday}/{state.settings.dailyGoals.tasks}</div>
          <div className="stat-label">Oppgaver</div>
          <div className="progress-bar" style={{ width: '100%', marginTop: 4 }}>
            <div className="progress-fill" style={{ width: `${taskProgress}%` }} />
          </div>
        </button>

        <button className="stat-item card-interactive" onClick={() => onNavigate('focus')}>
          <div style={{ color: 'var(--warning)' }}><ZapIcon /></div>
          <div className="stat-value">{todayFocusMinutes}m</div>
          <div className="stat-label">Fokustid</div>
          <div className="progress-bar" style={{ width: '100%', marginTop: 4 }}>
            <div className="progress-fill" style={{ width: `${focusProgress}%` }} />
          </div>
        </button>

        <button className="stat-item card-interactive" onClick={() => onNavigate('health')}>
          <div style={{ color: 'var(--info)' }}><DropletIcon /></div>
          <div className="stat-value">{todayLog?.water ?? 0}/{state.settings.dailyGoals.water}</div>
          <div className="stat-label">Vann</div>
          <div className="progress-bar" style={{ width: '100%', marginTop: 4 }}>
            <div className="progress-fill" style={{ width: `${waterProgress}%` }} />
          </div>
        </button>

        <button className="stat-item card-interactive" onClick={() => onNavigate('health')}>
          <div style={{ color: medProgress === 100 ? 'var(--success)' : 'var(--error)' }}><FlameIcon /></div>
          <div className="stat-value">{takenMedDoses}/{totalMedDoses}</div>
          <div className="stat-label">Medisiner</div>
          <div className="progress-bar" style={{ width: '100%', marginTop: 4 }}>
            <div className={`progress-fill ${medProgress === 100 ? 'progress-fill-success' : ''}`} style={{ width: `${medProgress}%` }} />
          </div>
        </button>
      </div>

      {/* Streaks */}
      <div className="card mb-lg">
        <div className="section-header">
          <div>
            <div className="section-title">Streaks</div>
            <div className="section-subtitle">Hold det gaende!</div>
          </div>
          <div style={{ fontSize: 28 }}>🔥</div>
        </div>
        <div className="stat-grid-3">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gold-text)' }}>{state.streaks.currentTaskStreak}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Oppgave-streak</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gold-text)' }}>{state.streaks.longestTaskStreak}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Lengste streak</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gold-text)' }}>{state.streaks.currentMedStreak}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Med-streak</div>
          </div>
        </div>
      </div>

      {/* Mood / Energy Quick Check */}
      {todayLog && (
        <div className="card mb-lg">
          <div className="section-title mb-md">Dagens status</div>
          <div className="row gap-md" style={{ flexWrap: 'wrap' }}>
            <div className="pill">
              Humør: {['😫', '😕', '😐', '🙂', '😄'][todayLog.mood - 1]}
            </div>
            <div className="pill">
              Energi: {['🪫', '🔋', '🔋', '⚡', '⚡'][todayLog.energy - 1]} {todayLog.energy}/5
            </div>
            <div className="pill">
              Søvn: {todayLog.sleepHours}t
            </div>
            {todayLog.symptoms.length > 0 && todayLog.symptoms.map(s => (
              <div key={s} className="pill pill-warning">{s}</div>
            ))}
          </div>
        </div>
      )}

      {/* Brain Dump Preview */}
      {brainDumpCount > 0 && (
        <button className="card card-interactive w-full mb-lg" onClick={() => onNavigate('tasks')} style={{ textAlign: 'left' }}>
          <div className="row gap-sm">
            <div style={{ color: 'var(--gold-text)' }}><BrainIcon /></div>
            <div className="grow">
              <div style={{ fontWeight: 700, fontSize: 14 }}>Brain Dump</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {brainDumpCount} tanke{brainDumpCount !== 1 ? 'r' : ''} venter
              </div>
            </div>
          </div>
        </button>
      )}

      {/* Upcoming Tasks */}
      {todayTasks.filter(t => t.status !== 'done').slice(0, 3).length > 0 && (
        <div className="card">
          <div className="section-header">
            <div className="section-title">Neste oppgaver</div>
            <button className="section-action" onClick={() => onNavigate('tasks')}>Se alle</button>
          </div>
          <div className="stack gap-sm">
            {todayTasks.filter(t => t.status !== 'done').slice(0, 3).map(task => (
              <div key={task.id} className="card card-compact row gap-sm" style={{ padding: '12px 14px' }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: `var(--priority-${task.priority})`,
                }} />
                <div className="grow">
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{task.title}</div>
                  {task.estimatedMinutes && (
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>~{task.estimatedMinutes} min</div>
                  )}
                </div>
                <div className="pill" style={{ fontSize: 10, padding: '4px 8px' }}>{task.category}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

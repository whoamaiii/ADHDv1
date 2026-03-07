import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { AppState, TimerMode, FocusSession } from '../types';
import { getToday } from '../utils/storage';
import { PlayIcon, PauseIcon, SkipIcon, ResetIcon, ZapIcon } from '../utils/icons';

interface Props {
  state: AppState;
  onAddFocusSession: (session: Omit<FocusSession, 'id'>) => void;
  onUpdateSettings: (updates: Record<string, unknown>) => void;
}

export const FocusTimer: React.FC<Props> = ({ state, onAddFocusSession }) => {
  const { timerSettings } = state.settings;
  const [mode, setMode] = useState<TimerMode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(timerSettings.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<string | null>(null);

  const totalSeconds = useMemo(() => {
    if (mode === 'focus') return timerSettings.focusMinutes * 60;
    if (mode === 'short_break') return timerSettings.shortBreakMinutes * 60;
    return timerSettings.longBreakMinutes * 60;
  }, [mode, timerSettings]);

  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (mode === 'focus') {
      const completed = sessionsCompleted + 1;
      setSessionsCompleted(completed);

      onAddFocusSession({
        startedAt: startTimeRef.current || new Date().toISOString(),
        endedAt: new Date().toISOString(),
        mode: 'focus',
        completedMinutes: timerSettings.focusMinutes,
        taskId: selectedTaskId || undefined,
      });

      // Auto transition
      if (completed % timerSettings.sessionsBeforeLongBreak === 0) {
        setMode('long_break');
        setSecondsLeft(timerSettings.longBreakMinutes * 60);
      } else {
        setMode('short_break');
        setSecondsLeft(timerSettings.shortBreakMinutes * 60);
      }

      if (timerSettings.autoStartBreaks) {
        setTimeout(() => startTimer(), 500);
      }
    } else {
      setMode('focus');
      setSecondsLeft(timerSettings.focusMinutes * 60);

      if (timerSettings.autoStartFocus) {
        setTimeout(() => startTimer(), 500);
      }
    }
  }, [mode, sessionsCompleted, timerSettings, onAddFocusSession, selectedTaskId]);

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, handleComplete]);

  const startTimer = useCallback(() => {
    if (!startTimeRef.current) startTimeRef.current = new Date().toISOString();
    setIsRunning(true);
  }, []);

  const pauseTimer = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    startTimeRef.current = null;
    setSecondsLeft(totalSeconds);
  };

  const skipToNext = () => handleComplete();

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    startTimeRef.current = null;
    setMode(newMode);
    if (newMode === 'focus') setSecondsLeft(timerSettings.focusMinutes * 60);
    else if (newMode === 'short_break') setSecondsLeft(timerSettings.shortBreakMinutes * 60);
    else setSecondsLeft(timerSettings.longBreakMinutes * 60);
  };

  // Today's stats
  const today = getToday();
  const todayFocus = state.focusSessions
    .filter(s => s.startedAt.startsWith(today) && s.mode === 'focus')
    .reduce((sum, s) => sum + s.completedMinutes, 0);

  const activeTasks = state.tasks.filter(t => t.status === 'todo' || t.status === 'in_progress');

  // Circle dimensions
  const circleSize = 260;
  const strokeWidth = 6;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="screen-content">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 4 }}>Fokus</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {todayFocus} min i dag · {sessionsCompleted} økter
        </p>
      </div>

      {/* Mode Selector */}
      <div className="row gap-sm mb-lg" style={{ justifyContent: 'center' }}>
        {[
          { mode: 'focus' as TimerMode, label: 'Fokus' },
          { mode: 'short_break' as TimerMode, label: 'Kort pause' },
          { mode: 'long_break' as TimerMode, label: 'Lang pause' },
        ].map(item => (
          <button
            key={item.mode}
            className={`chip ${mode === item.mode ? 'selected' : ''}`}
            onClick={() => switchMode(item.mode)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <div style={{ position: 'relative', width: circleSize, height: circleSize }}>
          {/* Glow behind */}
          {isRunning && (
            <div style={{
              position: 'absolute', inset: -20,
              borderRadius: '50%',
              background: mode === 'focus'
                ? 'radial-gradient(circle, rgba(245,197,24,0.15), transparent 70%)'
                : 'radial-gradient(circle, rgba(52,211,153,0.15), transparent 70%)',
              filter: 'blur(20px)',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
          )}

          <svg width={circleSize} height={circleSize} style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle cx={circleSize / 2} cy={circleSize / 2} r={radius}
              stroke="var(--bg-input)" strokeWidth={strokeWidth} fill="none" />
            {/* Progress */}
            <circle cx={circleSize / 2} cy={circleSize / 2} r={radius}
              stroke={mode === 'focus' ? 'url(#goldGrad)' : 'var(--success)'}
              strokeWidth={strokeWidth} fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.5s var(--spring)' }}
            />
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--gold-1)" />
                <stop offset="100%" stopColor="var(--gold-3)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center text */}
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(secondsLeft)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {mode === 'focus' ? 'Fokus' : mode === 'short_break' ? 'Kort pause' : 'Lang pause'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="row gap-md" style={{ justifyContent: 'center', marginBottom: 32 }}>
        <button className="btn btn-ghost btn-icon" onClick={resetTimer}>
          <ResetIcon />
        </button>
        <button
          className="btn btn-gold"
          onClick={isRunning ? pauseTimer : startTimer}
          style={{ width: 72, height: 72, borderRadius: '50%', padding: 0 }}
        >
          {isRunning ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button className="btn btn-ghost btn-icon" onClick={skipToNext}>
          <SkipIcon />
        </button>
      </div>

      {/* Session indicators */}
      <div className="row gap-sm" style={{ justifyContent: 'center', marginBottom: 24 }}>
        {Array.from({ length: timerSettings.sessionsBeforeLongBreak }).map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i < (sessionsCompleted % timerSettings.sessionsBeforeLongBreak)
              ? 'var(--gold-2)' : 'var(--bg-input)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Link task */}
      {activeTasks.length > 0 && (
        <div className="card mb-lg">
          <div className="form-label mb-sm">Koble til oppgave</div>
          <div className="select-wrap">
            <select
              value={selectedTaskId || ''}
              onChange={e => setSelectedTaskId(e.target.value || null)}
            >
              <option value="">Ingen oppgave valgt</option>
              {activeTasks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Today's sessions */}
      <div className="card">
        <div className="section-title mb-md">Dagens økter</div>
        {state.focusSessions.filter(s => s.startedAt.startsWith(today)).length === 0 ? (
          <div className="empty-state" style={{ padding: '14px 0' }}>
            <div style={{ color: 'var(--text-tertiary)' }}><ZapIcon /></div>
            <div className="empty-state-text">Ingen økter fullført i dag</div>
          </div>
        ) : (
          <div className="stack gap-sm">
            {state.focusSessions
              .filter(s => s.startedAt.startsWith(today))
              .reverse()
              .map(session => {
                const linkedTask = session.taskId ? state.tasks.find(t => t.id === session.taskId) : null;
                return (
                  <div key={session.id} className="card card-compact row between">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {session.mode === 'focus' ? 'Fokus' : 'Pause'} · {session.completedMinutes} min
                      </div>
                      {linkedTask && (
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{linkedTask.title}</div>
                      )}
                    </div>
                    <div className="pill" style={{ fontSize: 10, padding: '3px 8px' }}>
                      {new Date(session.startedAt).toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

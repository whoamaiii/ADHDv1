import React, { useState, useMemo } from 'react';
import type { AppState, MoodLevel, EnergyLevel, SleepQuality, ExerciseLog, Medication } from '../types';
import { getToday, generateId } from '../utils/storage';
import { PlusIcon, XIcon, CheckIcon, DropletIcon, PillIcon, FlameIcon, MoonIcon } from '../utils/icons';

interface Props {
  state: AppState;
  onUpdateTodayLog: (updates: Record<string, unknown>) => void;
  onLogMedication: (medId: string, scheduledTime: string, taken: boolean) => void;
  onUpdateSettings: (updates: Record<string, unknown>) => void;
}

const MOOD_EMOJIS = ['😫', '😕', '😐', '🙂', '😄'];
const MOOD_LABELS = ['Veldig dårlig', 'Dårlig', 'Okei', 'Bra', 'Fantastisk'];
const ENERGY_LABELS = ['Utmattet', 'Lav', 'Normal', 'Høy', 'Superladet'];

export const HealthTracker: React.FC<Props> = ({ state, onUpdateTodayLog, onLogMedication, onUpdateSettings }) => {
  const today = getToday();
  const todayLog = state.dailyLogs.find(l => l.date === today);
  const [showMedModal, setShowMedModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>('mood');

  const mood = (todayLog?.mood ?? 3) as MoodLevel;
  const energy = (todayLog?.energy ?? 3) as EnergyLevel;
  const sleepHours = todayLog?.sleepHours ?? 7;
  const sleepQuality = (todayLog?.sleepQuality ?? 3) as SleepQuality;
  const water = todayLog?.water ?? 0;
  const symptoms = todayLog?.symptoms ?? [];
  const exercises = todayLog?.exercise ?? [];

  const activeMeds = state.settings.medications.filter(m => m.active);

  // Week mood chart data
  const weekData = useMemo(() => {
    const days: Array<{ day: string; mood: number; energy: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = state.dailyLogs.find(l => l.date === dateStr);
      days.push({
        day: d.toLocaleDateString('no-NO', { weekday: 'short' }),
        mood: log?.mood ?? 0,
        energy: log?.energy ?? 0,
      });
    }
    return days;
  }, [state.dailyLogs]);

  return (
    <div className="screen-content">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 4 }}>Helse</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Spor kropp og sinn</p>
      </div>

      {/* Mood & Energy */}
      <div className="card mb-lg">
        <button className="row between w-full" onClick={() => setActiveSection(activeSection === 'mood' ? null : 'mood')}>
          <div className="section-title">Humør & Energi</div>
          <span style={{ fontSize: 28 }}>{MOOD_EMOJIS[mood - 1]}</span>
        </button>
        {activeSection === 'mood' && (
          <div style={{ marginTop: 16 }}>
            <div className="mb-md">
              <div className="form-label mb-sm">Humør: {MOOD_LABELS[mood - 1]}</div>
              <div className="row gap-sm" style={{ justifyContent: 'space-between' }}>
                {([1, 2, 3, 4, 5] as MoodLevel[]).map(level => (
                  <button
                    key={level}
                    onClick={() => onUpdateTodayLog({ mood: level })}
                    style={{
                      fontSize: 28, padding: 6, borderRadius: 'var(--radius-sm)',
                      background: mood === level ? 'var(--gold-bg-strong)' : 'transparent',
                      transform: mood === level ? 'scale(1.2)' : 'scale(1)',
                      transition: 'all 0.2s var(--spring)',
                    }}
                  >
                    {MOOD_EMOJIS[level - 1]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="form-label mb-sm">Energi: {ENERGY_LABELS[energy - 1]}</div>
              <div className="row gap-sm">
                {([1, 2, 3, 4, 5] as EnergyLevel[]).map(level => (
                  <button
                    key={level}
                    className={`chip ${energy === level ? 'selected' : ''}`}
                    onClick={() => onUpdateTodayLog({ energy: level })}
                    style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '8px 4px' }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Medications */}
      <div className="card mb-lg">
        <div className="row between mb-md">
          <div className="row gap-sm">
            <div style={{ color: 'var(--gold-text)' }}><PillIcon /></div>
            <div className="section-title">Medisiner</div>
          </div>
          <button className="section-action" onClick={() => setShowMedModal(true)}>
            <PlusIcon /> Ny
          </button>
        </div>

        {activeMeds.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px 0' }}>
            <div className="empty-state-text">Ingen medisiner lagt til ennå</div>
          </div>
        ) : (
          <div className="stack gap-sm">
            {activeMeds.map(med => (
              <div key={med.id} className="card card-compact">
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{med.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>{med.dosage}</div>
                <div className="row gap-sm" style={{ flexWrap: 'wrap' }}>
                  {med.times.map(time => {
                    const taken = todayLog?.medications.some(m => m.medicationId === med.id && m.scheduledTime === time && m.taken) ?? false;
                    return (
                      <button
                        key={time}
                        className={`chip ${taken ? 'selected' : ''}`}
                        onClick={() => onLogMedication(med.id, time, !taken)}
                        style={taken ? { background: 'var(--success-bg)', borderColor: 'var(--success)', color: 'var(--success)' } : {}}
                      >
                        {taken && <CheckIcon />} {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Water */}
      <div className="card mb-lg">
        <div className="row between mb-md">
          <div className="row gap-sm">
            <div style={{ color: 'var(--info)' }}><DropletIcon /></div>
            <div className="section-title">Vann</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold-text)' }}>
            {water} / {state.settings.dailyGoals.water} glass
          </div>
        </div>
        <div className="progress-bar mb-sm">
          <div className="progress-fill" style={{ width: `${Math.min(100, (water / state.settings.dailyGoals.water) * 100)}%` }} />
        </div>
        <div className="row gap-sm" style={{ justifyContent: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onUpdateTodayLog({ water: Math.max(0, water - 1) })}>−</button>
          <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold-text)', minWidth: 40, textAlign: 'center' }}>{water}</span>
          <button className="btn btn-gold btn-sm" onClick={() => onUpdateTodayLog({ water: water + 1 })}>+</button>
        </div>
      </div>

      {/* Sleep */}
      <div className="card mb-lg">
        <div className="row gap-sm mb-md">
          <div style={{ color: 'var(--gold-text)' }}><MoonIcon /></div>
          <div className="section-title">Søvn</div>
        </div>
        <div className="row gap-md" style={{ flexWrap: 'wrap' }}>
          <div className="form-group grow">
            <label className="form-label">Timer</label>
            <input
              type="number" min="0" max="24" step="0.5"
              value={sleepHours}
              onChange={e => onUpdateTodayLog({ sleepHours: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group grow">
            <label className="form-label">Kvalitet</label>
            <div className="row gap-sm">
              {([1, 2, 3, 4, 5] as SleepQuality[]).map(q => (
                <button
                  key={q}
                  className={`chip ${sleepQuality === q ? 'selected' : ''}`}
                  onClick={() => onUpdateTodayLog({ sleepQuality: q })}
                  style={{ flex: 1, justifyContent: 'center', padding: '8px 2px' }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Exercise */}
      <div className="card mb-lg">
        <div className="row between mb-md">
          <div className="row gap-sm">
            <div style={{ color: 'var(--success)' }}><FlameIcon /></div>
            <div className="section-title">Trening</div>
          </div>
          <button className="section-action" onClick={() => setShowExerciseModal(true)}>
            <PlusIcon /> Legg til
          </button>
        </div>
        {exercises.length === 0 ? (
          <div className="empty-state" style={{ padding: '14px 0' }}>
            <div className="empty-state-text">Ingen trening logget i dag</div>
          </div>
        ) : (
          <div className="stack gap-sm">
            {exercises.map((ex, i) => (
              <div key={i} className="card card-compact row between">
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{ex.type}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {ex.durationMinutes} min · {ex.intensity === 'light' ? 'Lett' : ex.intensity === 'moderate' ? 'Moderat' : 'Intens'}
                  </div>
                </div>
                <button onClick={() => {
                  const updated = [...exercises];
                  updated.splice(i, 1);
                  onUpdateTodayLog({ exercise: updated });
                }} style={{ color: 'var(--text-tertiary)' }}>
                  <XIcon />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Symptoms */}
      <div className="card mb-lg">
        <div className="section-title mb-md">Symptomer</div>
        <div className="row gap-sm" style={{ flexWrap: 'wrap' }}>
          {state.settings.symptoms.map(s => (
            <button
              key={s}
              className={`chip ${symptoms.includes(s) ? 'selected' : ''}`}
              onClick={() => {
                const updated = symptoms.includes(s) ? symptoms.filter(x => x !== s) : [...symptoms, s];
                onUpdateTodayLog({ symptoms: updated });
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Week Overview */}
      <div className="card">
        <div className="section-title mb-md">Denne uken</div>
        <div className="row gap-sm" style={{ justifyContent: 'space-between', alignItems: 'flex-end', height: 100 }}>
          {weekData.map((d, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
              <div style={{
                width: '100%', maxWidth: 28,
                height: d.mood > 0 ? d.mood * 16 : 4,
                borderRadius: 'var(--radius-sm)',
                background: d.mood > 0
                  ? `linear-gradient(180deg, var(--gold-2), var(--gold-3))`
                  : 'var(--bg-input)',
                transition: 'height 0.3s var(--spring)',
              }} />
              <span style={{ fontSize: 9, color: 'var(--text-secondary)', fontWeight: 600 }}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Medication Modal */}
      {showMedModal && (
        <AddMedicationModal
          onAdd={(med) => {
            onUpdateSettings({ medications: [...state.settings.medications, med] });
            setShowMedModal(false);
          }}
          onClose={() => setShowMedModal(false)}
        />
      )}

      {/* Add Exercise Modal */}
      {showExerciseModal && (
        <AddExerciseModal
          onAdd={(ex) => {
            onUpdateTodayLog({ exercise: [...exercises, ex] });
            setShowExerciseModal(false);
          }}
          onClose={() => setShowExerciseModal(false)}
        />
      )}
    </div>
  );
};

// ── Add Medication Modal ──
const AddMedicationModal: React.FC<{ onAdd: (med: Medication) => void; onClose: () => void }> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [newTime, setNewTime] = useState('');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <div className="modal-title">Ny medisin</div>
          <button className="btn btn-ghost btn-icon-sm" onClick={onClose}><XIcon /></button>
        </div>
        <div className="stack gap-md">
          <div className="form-group">
            <label className="form-label">Navn</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="f.eks. Ritalin" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Dosering</label>
            <input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="f.eks. 20mg" />
          </div>
          <div className="form-group">
            <label className="form-label">Tidspunkter</label>
            <div className="row gap-sm" style={{ flexWrap: 'wrap' }}>
              {times.map((t, i) => (
                <div key={i} className="chip">
                  {t}
                  <button onClick={() => setTimes(times.filter((_, j) => j !== i))} style={{ color: 'var(--text-tertiary)', marginLeft: 4 }}>×</button>
                </div>
              ))}
            </div>
            <div className="row gap-sm mt-sm">
              <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn-ghost btn-sm" onClick={() => { if (newTime) { setTimes([...times, newTime]); setNewTime(''); } }}>
                <PlusIcon /> Legg til
              </button>
            </div>
          </div>
          <button
            className="btn btn-gold w-full"
            onClick={() => { if (name.trim()) onAdd({ id: generateId(), name: name.trim(), dosage: dosage.trim(), times, active: true }); }}
            disabled={!name.trim()}
          >
            Lagre medisin
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Add Exercise Modal ──
const AddExerciseModal: React.FC<{ onAdd: (ex: ExerciseLog) => void; onClose: () => void }> = ({ onAdd, onClose }) => {
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('30');
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'intense'>('moderate');

  const exerciseTypes = ['Gåtur', 'Løping', 'Styrke', 'Yoga', 'Sykling', 'Svømming', 'Dans', 'Annet'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <div className="modal-title">Logg trening</div>
          <button className="btn btn-ghost btn-icon-sm" onClick={onClose}><XIcon /></button>
        </div>
        <div className="stack gap-md">
          <div className="form-group">
            <label className="form-label">Type</label>
            <div className="row gap-sm" style={{ flexWrap: 'wrap' }}>
              {exerciseTypes.map(t => (
                <button key={t} className={`chip ${type === t ? 'selected' : ''}`} onClick={() => setType(t)}>{t}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Varighet (min)</label>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Intensitet</label>
            <div className="row gap-sm">
              {(['light', 'moderate', 'intense'] as const).map(i => (
                <button key={i} className={`chip ${intensity === i ? 'selected' : ''}`} onClick={() => setIntensity(i)} style={{ flex: 1, justifyContent: 'center' }}>
                  {i === 'light' ? 'Lett' : i === 'moderate' ? 'Moderat' : 'Intens'}
                </button>
              ))}
            </div>
          </div>
          <button
            className="btn btn-gold w-full"
            onClick={() => { if (type) onAdd({ type, durationMinutes: parseInt(duration) || 30, intensity }); }}
            disabled={!type}
          >
            Lagre trening
          </button>
        </div>
      </div>
    </div>
  );
};

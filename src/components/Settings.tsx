import React, { useState } from 'react';
import type { UserSettings, Medication } from '../types';
import { SunIcon, MoonIcon, BellIcon, PlusIcon, XIcon, TrashIcon } from '../utils/icons';

interface Props {
  settings: UserSettings;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
  onClearData: () => void;
}

export const Settings: React.FC<Props> = ({ settings, onUpdateSettings, onClearData }) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [newSymptom, setNewSymptom] = useState('');

  return (
    <div className="screen-content">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 4 }}>Innstillinger</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Tilpass appen din</p>
      </div>

      {/* Profile */}
      <div className="card mb-lg">
        <div className="section-title mb-md">Profil</div>
        <div className="form-group">
          <label className="form-label">Navn</label>
          <input
            value={settings.displayName}
            onChange={e => onUpdateSettings({ displayName: e.target.value })}
            placeholder="Ditt navn"
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="card mb-lg">
        <div className="section-title mb-md">Utseende</div>
        <div className="row between">
          <div className="row gap-sm">
            {settings.theme === 'dark' ? <MoonIcon /> : <SunIcon />}
            <span style={{ fontWeight: 600, fontSize: 14 }}>
              {settings.theme === 'dark' ? 'Mørkt tema' : 'Lyst tema'}
            </span>
          </div>
          <button
            className={`toggle-track ${settings.theme === 'dark' ? 'on' : ''}`}
            onClick={() => onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
          >
            <div className="toggle-thumb" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card mb-lg">
        <div className="section-title mb-md">Varsler</div>
        <div className="stack gap-md">
          <div className="row between">
            <div className="row gap-sm">
              <BellIcon />
              <span style={{ fontWeight: 600, fontSize: 14 }}>Påminnelser</span>
            </div>
            <button
              className={`toggle-track ${settings.notifications ? 'on' : ''}`}
              onClick={() => onUpdateSettings({ notifications: !settings.notifications })}
            >
              <div className="toggle-thumb" />
            </button>
          </div>
          <div className="row between">
            <span style={{ fontWeight: 600, fontSize: 14 }}>Haptisk feedback</span>
            <button
              className={`toggle-track ${settings.hapticFeedback ? 'on' : ''}`}
              onClick={() => onUpdateSettings({ hapticFeedback: !settings.hapticFeedback })}
            >
              <div className="toggle-thumb" />
            </button>
          </div>
        </div>
      </div>

      {/* Timer Settings */}
      <div className="card mb-lg">
        <div className="section-title mb-md">Fokustimer</div>
        <div className="stack gap-md">
          <div className="row between">
            <span style={{ fontSize: 14 }}>Fokustid</span>
            <div className="row gap-sm">
              {[15, 20, 25, 30, 45].map(m => (
                <button
                  key={m}
                  className={`chip ${settings.timerSettings.focusMinutes === m ? 'selected' : ''}`}
                  onClick={() => onUpdateSettings({ timerSettings: { ...settings.timerSettings, focusMinutes: m } })}
                  style={{ padding: '6px 10px', fontSize: 12 }}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
          <div className="row between">
            <span style={{ fontSize: 14 }}>Kort pause</span>
            <div className="row gap-sm">
              {[3, 5, 10].map(m => (
                <button
                  key={m}
                  className={`chip ${settings.timerSettings.shortBreakMinutes === m ? 'selected' : ''}`}
                  onClick={() => onUpdateSettings({ timerSettings: { ...settings.timerSettings, shortBreakMinutes: m } })}
                  style={{ padding: '6px 10px', fontSize: 12 }}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
          <div className="row between">
            <span style={{ fontSize: 14 }}>Lang pause</span>
            <div className="row gap-sm">
              {[10, 15, 20, 30].map(m => (
                <button
                  key={m}
                  className={`chip ${settings.timerSettings.longBreakMinutes === m ? 'selected' : ''}`}
                  onClick={() => onUpdateSettings({ timerSettings: { ...settings.timerSettings, longBreakMinutes: m } })}
                  style={{ padding: '6px 10px', fontSize: 12 }}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
          <div className="row between">
            <span style={{ fontSize: 14 }}>Auto-start pauser</span>
            <button
              className={`toggle-track ${settings.timerSettings.autoStartBreaks ? 'on' : ''}`}
              onClick={() => onUpdateSettings({ timerSettings: { ...settings.timerSettings, autoStartBreaks: !settings.timerSettings.autoStartBreaks } })}
            >
              <div className="toggle-thumb" />
            </button>
          </div>
          <div className="row between">
            <span style={{ fontSize: 14 }}>Auto-start fokus</span>
            <button
              className={`toggle-track ${settings.timerSettings.autoStartFocus ? 'on' : ''}`}
              onClick={() => onUpdateSettings({ timerSettings: { ...settings.timerSettings, autoStartFocus: !settings.timerSettings.autoStartFocus } })}
            >
              <div className="toggle-thumb" />
            </button>
          </div>
        </div>
      </div>

      {/* Daily Goals */}
      <div className="card mb-lg">
        <div className="section-title mb-md">Daglige mål</div>
        <div className="stack gap-md">
          <div className="row between gap-sm">
            <span style={{ fontSize: 14, flex: 1 }}>Oppgaver per dag</span>
            <input
              type="number" min="1" max="20"
              value={settings.dailyGoals.tasks}
              onChange={e => onUpdateSettings({ dailyGoals: { ...settings.dailyGoals, tasks: parseInt(e.target.value) || 5 } })}
              style={{ width: 70, textAlign: 'center' }}
            />
          </div>
          <div className="row between gap-sm">
            <span style={{ fontSize: 14, flex: 1 }}>Glass vann</span>
            <input
              type="number" min="1" max="20"
              value={settings.dailyGoals.water}
              onChange={e => onUpdateSettings({ dailyGoals: { ...settings.dailyGoals, water: parseInt(e.target.value) || 8 } })}
              style={{ width: 70, textAlign: 'center' }}
            />
          </div>
          <div className="row between gap-sm">
            <span style={{ fontSize: 14, flex: 1 }}>Treningsminutter</span>
            <input
              type="number" min="0" max="180" step="5"
              value={settings.dailyGoals.exerciseMinutes}
              onChange={e => onUpdateSettings({ dailyGoals: { ...settings.dailyGoals, exerciseMinutes: parseInt(e.target.value) || 30 } })}
              style={{ width: 70, textAlign: 'center' }}
            />
          </div>
          <div className="row between gap-sm">
            <span style={{ fontSize: 14, flex: 1 }}>Fokusminutter</span>
            <input
              type="number" min="0" max="480" step="15"
              value={settings.dailyGoals.focusMinutes}
              onChange={e => onUpdateSettings({ dailyGoals: { ...settings.dailyGoals, focusMinutes: parseInt(e.target.value) || 120 } })}
              style={{ width: 70, textAlign: 'center' }}
            />
          </div>
        </div>
      </div>

      {/* Symptoms */}
      <div className="card mb-lg">
        <div className="section-title mb-md">Symptomer å spore</div>
        <div className="row gap-sm mb-md" style={{ flexWrap: 'wrap' }}>
          {settings.symptoms.map(s => (
            <div key={s} className="chip">
              {s}
              <button onClick={() => onUpdateSettings({ symptoms: settings.symptoms.filter(x => x !== s) })} style={{ color: 'var(--text-tertiary)', marginLeft: 4, fontSize: 14 }}>
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="row gap-sm">
          <input
            value={newSymptom}
            onChange={e => setNewSymptom(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && newSymptom.trim()) {
                onUpdateSettings({ symptoms: [...settings.symptoms, newSymptom.trim()] });
                setNewSymptom('');
              }
            }}
            placeholder="Nytt symptom..."
            style={{ flex: 1 }}
          />
          <button className="btn btn-ghost btn-sm" onClick={() => {
            if (newSymptom.trim()) {
              onUpdateSettings({ symptoms: [...settings.symptoms, newSymptom.trim()] });
              setNewSymptom('');
            }
          }}>
            <PlusIcon />
          </button>
        </div>
      </div>

      {/* Medications Management */}
      <div className="card mb-lg">
        <div className="section-title mb-md">Medisiner</div>
        {settings.medications.length === 0 ? (
          <div className="empty-state" style={{ padding: '14px 0' }}>
            <div className="empty-state-text">Legg til medisiner via Helse-fanen</div>
          </div>
        ) : (
          <div className="stack gap-sm">
            {settings.medications.map(med => (
              <div key={med.id} className="card card-compact row between">
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, opacity: med.active ? 1 : 0.5 }}>
                    {med.name} — {med.dosage}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {med.times.join(', ')} · {med.active ? 'Aktiv' : 'Inaktiv'}
                  </div>
                </div>
                <div className="row gap-sm">
                  <button
                    className={`toggle-track ${med.active ? 'on' : ''}`}
                    style={{ transform: 'scale(0.8)' }}
                    onClick={() => {
                      onUpdateSettings({
                        medications: settings.medications.map(m =>
                          m.id === med.id ? { ...m, active: !m.active } : m
                        ),
                      });
                    }}
                  >
                    <div className="toggle-thumb" />
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ medications: settings.medications.filter(m => m.id !== med.id) })}
                    style={{ color: 'var(--error)' }}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data */}
      <div className="card mb-lg">
        <div className="section-title mb-md">Data</div>
        {!showClearConfirm ? (
          <button className="btn btn-ghost w-full" onClick={() => setShowClearConfirm(true)} style={{ color: 'var(--error)' }}>
            <TrashIcon /> Slett all data
          </button>
        ) : (
          <div className="stack gap-sm">
            <p style={{ fontSize: 13, color: 'var(--error)', textAlign: 'center' }}>Er du sikker? Dette kan ikke angres!</p>
            <div className="row gap-sm" style={{ justifyContent: 'center' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowClearConfirm(false)}>Avbryt</button>
              <button className="btn btn-sm" style={{ background: 'var(--error)', color: 'white' }} onClick={onClearData}>
                Ja, slett alt
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Version */}
      <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-tertiary)', fontSize: 12 }}>
        ADHD Companion v1.0 — Laget for deg 💛
      </div>
    </div>
  );
};

import React, { useState, useCallback, useMemo } from 'react';
import type { Task, TaskPriority, TaskCategory, TaskStatus, RecurrenceType, Subtask, BrainDumpEntry } from '../types';
import { generateId } from '../utils/storage';
import { PlusIcon, CheckIcon, TrashIcon, XIcon, EditIcon, ChevronDownIcon, BrainIcon, ChevronRightIcon } from '../utils/icons';

interface Props {
  tasks: Task[];
  brainDump: BrainDumpEntry[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'order'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onCompleteTask: (id: string) => void;
  onAddBrainDump: (text: string) => void;
  onDeleteBrainDump: (id: string) => void;
  onConvertBrainDump: (id: string) => void;
}

type FilterStatus = 'all' | TaskStatus;
type SortBy = 'priority' | 'created' | 'category';

const PRIORITIES: TaskPriority[] = ['urgent', 'high', 'medium', 'low'];
const CATEGORIES: TaskCategory[] = ['work', 'personal', 'health', 'home', 'errands', 'social', 'creative'];
const PRIORITY_LABELS: Record<TaskPriority, string> = { urgent: 'Haster', high: 'Høy', medium: 'Medium', low: 'Lav' };
const CATEGORY_LABELS: Record<TaskCategory, string> = { work: 'Jobb', personal: 'Personlig', health: 'Helse', home: 'Hjemme', errands: 'Ærend', social: 'Sosialt', creative: 'Kreativt' };
const STATUS_LABELS: Record<TaskStatus, string> = { todo: 'Å gjøre', in_progress: 'Pågår', done: 'Ferdig', skipped: 'Hoppet over' };

export const TaskManager: React.FC<Props> = ({
  tasks, brainDump, onAddTask, onUpdateTask, onDeleteTask, onCompleteTask,
  onAddBrainDump, onDeleteBrainDump, onConvertBrainDump,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBrainDump, setShowBrainDump] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('priority');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [brainDumpText, setBrainDumpText] = useState('');

  const filteredTasks = useMemo(() => {
    let filtered = filterStatus === 'all' ? tasks : tasks.filter(t => t.status === filterStatus);
    return filtered.sort((a, b) => {
      if (sortBy === 'priority') return PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority);
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, filterStatus, sortBy]);

  const handleBrainDumpSubmit = useCallback(() => {
    if (!brainDumpText.trim()) return;
    onAddBrainDump(brainDumpText.trim());
    setBrainDumpText('');
  }, [brainDumpText, onAddBrainDump]);

  const pendingDumps = brainDump.filter(b => !b.convertedToTaskId);

  return (
    <div className="screen-content">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 4 }}>Oppgaver</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length} aktive oppgaver
        </p>
      </div>

      {/* Quick Actions */}
      <div className="row gap-sm mb-md" style={{ flexWrap: 'wrap' }}>
        <button className="btn btn-gold btn-sm" onClick={() => setShowAddModal(true)}>
          <PlusIcon /> Ny oppgave
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowBrainDump(!showBrainDump)}>
          <BrainIcon /> Brain Dump {pendingDumps.length > 0 && `(${pendingDumps.length})`}
        </button>
      </div>

      {/* Brain Dump Section */}
      {showBrainDump && (
        <div className="card mb-lg">
          <div className="section-title mb-md">Brain Dump</div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Skriv ned alt som flyr gjennom hodet. Sorter det senere.
          </p>
          <div className="row gap-sm mb-md">
            <input
              value={brainDumpText}
              onChange={e => setBrainDumpText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleBrainDumpSubmit()}
              placeholder="Hva tenker du på?"
              style={{ flex: 1 }}
            />
            <button className="btn btn-gold btn-icon-sm" onClick={handleBrainDumpSubmit} style={{ width: 42, height: 42 }}>
              <PlusIcon />
            </button>
          </div>
          {pendingDumps.length > 0 && (
            <div className="stack gap-sm">
              {pendingDumps.map(entry => (
                <div key={entry.id} className="card card-compact row gap-sm">
                  <div className="grow" style={{ fontSize: 13 }}>{entry.text}</div>
                  <button className="btn btn-ghost btn-icon-sm" onClick={() => onConvertBrainDump(entry.id)} title="Gjør til oppgave">
                    <ChevronRightIcon />
                  </button>
                  <button className="btn btn-ghost btn-icon-sm" onClick={() => onDeleteBrainDump(entry.id)}>
                    <XIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="row gap-sm mb-md" style={{ overflowX: 'auto', paddingBottom: 4 }}>
        {(['all', 'todo', 'in_progress', 'done'] as FilterStatus[]).map(status => (
          <button
            key={status}
            className={`chip ${filterStatus === status ? 'selected' : ''}`}
            onClick={() => setFilterStatus(status)}
          >
            {status === 'all' ? 'Alle' : STATUS_LABELS[status as TaskStatus]}
          </button>
        ))}
      </div>

      <div className="row between mb-md">
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {filteredTasks.length} oppgave{filteredTasks.length !== 1 ? 'r' : ''}
        </div>
        <div className="select-wrap" style={{ width: 'auto' }}>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortBy)}
            style={{ fontSize: 12, padding: '6px 28px 6px 10px', background: 'var(--bg-card)' }}
          >
            <option value="priority">Prioritet</option>
            <option value="created">Nyeste</option>
            <option value="category">Kategori</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ fontSize: 40 }}>✨</div>
          <div className="empty-state-text">
            {filterStatus === 'all' ? 'Ingen oppgaver ennå. Trykk + for å legge til!' : 'Ingen oppgaver med denne statusen.'}
          </div>
        </div>
      ) : (
        <div className="stack gap-sm">
          {filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              expanded={expandedTask === task.id}
              onToggleExpand={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
              onComplete={() => onCompleteTask(task.id)}
              onUpdate={(updates) => onUpdateTask(task.id, updates)}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <AddTaskModal
          onAdd={(task) => { onAddTask(task); setShowAddModal(false); }}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

// ─── TaskItem ───
interface TaskItemProps {
  task: Task;
  expanded: boolean;
  onToggleExpand: () => void;
  onComplete: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, expanded, onToggleExpand, onComplete, onUpdate, onDelete }) => {
  const isDone = task.status === 'done';

  return (
    <div className="card card-compact" style={{ opacity: isDone ? 0.6 : 1 }}>
      <div className="row gap-sm" onClick={onToggleExpand} style={{ cursor: 'pointer' }}>
        {/* Priority dot & checkbox */}
        <button
          onClick={e => { e.stopPropagation(); if (!isDone) onComplete(); }}
          style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            border: isDone ? 'none' : `2px solid var(--priority-${task.priority})`,
            background: isDone ? 'var(--success)' : 'transparent',
            display: 'grid', placeItems: 'center', color: isDone ? '#fff' : 'transparent',
          }}
        >
          {isDone && <CheckIcon />}
        </button>

        <div className="grow" style={{ minWidth: 0 }}>
          <div style={{
            fontWeight: 600, fontSize: 14,
            textDecoration: isDone ? 'line-through' : 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {task.title}
          </div>
          <div className="row gap-sm" style={{ marginTop: 2 }}>
            <span style={{ fontSize: 10, color: `var(--priority-${task.priority})`, fontWeight: 700 }}>
              {PRIORITY_LABELS[task.priority]}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>·</span>
            <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
              {CATEGORY_LABELS[task.category]}
            </span>
            {task.estimatedMinutes && (
              <>
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>·</span>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>~{task.estimatedMinutes}m</span>
              </>
            )}
          </div>
        </div>

        <div style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-tertiary)' }}>
          <ChevronDownIcon />
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ marginTop: 14, borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
          {task.description && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{task.description}</p>
          )}

          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div className="stack gap-sm mb-md">
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Deloppgaver ({task.subtasks.filter(s => s.done).length}/{task.subtasks.length})
              </div>
              {task.subtasks.map(sub => (
                <button
                  key={sub.id}
                  className="row gap-sm"
                  style={{ padding: '4px 0', width: '100%', textAlign: 'left' }}
                  onClick={() => {
                    const updated = task.subtasks.map(s => s.id === sub.id ? { ...s, done: !s.done } : s);
                    onUpdate({ subtasks: updated });
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: sub.done ? 'none' : '1.5px solid var(--text-tertiary)',
                    background: sub.done ? 'var(--success)' : 'transparent',
                    display: 'grid', placeItems: 'center', color: '#fff',
                  }}>
                    {sub.done && <span style={{ fontSize: 10 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 13, textDecoration: sub.done ? 'line-through' : 'none', color: sub.done ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>
                    {sub.title}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Status Toggle */}
          {!isDone && (
            <div className="row gap-sm mb-md" style={{ flexWrap: 'wrap' }}>
              {(['todo', 'in_progress'] as TaskStatus[]).map(status => (
                <button
                  key={status}
                  className={`chip ${task.status === status ? 'selected' : ''}`}
                  onClick={() => onUpdate({ status })}
                  style={{ fontSize: 11 }}
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          )}

          <div className="row gap-sm" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost btn-sm" onClick={onDelete} style={{ color: 'var(--error)' }}>
              <TrashIcon /> Slett
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Add Task Modal ───
interface AddTaskModalProps {
  onAdd: (task: Omit<Task, 'id' | 'createdAt' | 'order'>) => void;
  onClose: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ onAdd, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('personal');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [subtaskText, setSubtaskText] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);

  const handleAddSubtask = () => {
    if (!subtaskText.trim()) return;
    setSubtasks([...subtasks, { id: generateId(), title: subtaskText.trim(), done: false }]);
    setSubtaskText('');
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status: 'todo',
      category,
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
      recurrence,
      subtasks,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <div className="modal-title">Ny oppgave</div>
          <button className="btn btn-ghost btn-icon-sm" onClick={onClose}><XIcon /></button>
        </div>

        <div className="stack gap-md">
          <div className="form-group">
            <label className="form-label">Tittel</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Hva skal gjøres?" autoFocus />
          </div>

          <div className="form-group">
            <label className="form-label">Beskrivelse (valgfritt)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detaljer..." rows={2} />
          </div>

          <div className="form-group">
            <label className="form-label">Prioritet</label>
            <div className="row gap-sm" style={{ flexWrap: 'wrap' }}>
              {PRIORITIES.map(p => (
                <button key={p} className={`chip ${priority === p ? 'selected' : ''}`} onClick={() => setPriority(p)}
                  style={{ borderColor: priority === p ? `var(--priority-${p})` : undefined }}>
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Kategori</label>
            <div className="row gap-sm" style={{ flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <button key={c} className={`chip ${category === c ? 'selected' : ''}`} onClick={() => setCategory(c)}>
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          <div className="row gap-sm">
            <div className="form-group grow">
              <label className="form-label">Tid (min)</label>
              <input type="number" value={estimatedMinutes} onChange={e => setEstimatedMinutes(e.target.value)} placeholder="25" />
            </div>
            <div className="form-group grow">
              <label className="form-label">Gjentakelse</label>
              <div className="select-wrap">
                <select value={recurrence} onChange={e => setRecurrence(e.target.value as RecurrenceType)}>
                  <option value="none">Ingen</option>
                  <option value="daily">Daglig</option>
                  <option value="weekdays">Hverdager</option>
                  <option value="weekly">Ukentlig</option>
                  <option value="monthly">Månedlig</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subtasks */}
          <div className="form-group">
            <label className="form-label">Deloppgaver</label>
            <div className="row gap-sm">
              <input value={subtaskText} onChange={e => setSubtaskText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                placeholder="Legg til steg..." style={{ flex: 1 }} />
              <button className="btn btn-ghost btn-icon-sm" onClick={handleAddSubtask}><PlusIcon /></button>
            </div>
            {subtasks.length > 0 && (
              <div className="stack gap-sm mt-sm">
                {subtasks.map((s, i) => (
                  <div key={s.id} className="row gap-sm" style={{ fontSize: 13 }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>{i + 1}.</span>
                    <span className="grow">{s.title}</span>
                    <button onClick={() => setSubtasks(subtasks.filter(st => st.id !== s.id))} style={{ color: 'var(--text-tertiary)' }}>
                      <XIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-gold w-full" onClick={handleSubmit} disabled={!title.trim()}>
            Legg til oppgave
          </button>
        </div>
      </div>
    </div>
  );
};

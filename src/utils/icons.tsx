import React from 'react';

// All icons as inline SVGs for zero dependencies
const s = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true as const };
const p = { stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

export function GridIcon() {
  return <svg {...s}><rect x="4" y="4" width="6" height="6" rx="1.8" {...p} /><rect x="14" y="4" width="6" height="6" rx="1.8" {...p} /><rect x="4" y="14" width="6" height="6" rx="1.8" {...p} /><rect x="14" y="14" width="6" height="6" rx="1.8" {...p} /></svg>;
}

export function CheckListIcon() {
  return <svg {...s}><path d="M9 6h9M9 12h9M9 18h9M5 6l-.5.5L4 6l.5-.5L5 6ZM5 12l-.5.5L4 12l.5-.5L5 12ZM5 18l-.5.5L4 18l.5-.5L5 18Z" {...p} /></svg>;
}

export function HeartIcon() {
  return <svg {...s}><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0L12 5.36l-.77-.78a5.4 5.4 0 0 0-7.65 7.65l.78.77L12 20.64l7.64-7.64.78-.77a5.4 5.4 0 0 0 0-7.65Z" {...p} /></svg>;
}

export function TimerIcon() {
  return <svg {...s}><circle cx="12" cy="13" r="8" {...p} /><path d="M12 9v4l2 2M5 3l2 2M19 3l-2 2" {...p} /></svg>;
}

export function SettingsIcon() {
  return <svg {...s}><circle cx="12" cy="12" r="3" {...p} /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" {...p} /></svg>;
}

export function PlusIcon() {
  return <svg {...s}><path d="M12 5v14M5 12h14" {...p} /></svg>;
}

export function TrashIcon() {
  return <svg {...s}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" {...p} /></svg>;
}

export function EditIcon() {
  return <svg {...s}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" {...p} /></svg>;
}

export function CheckIcon() {
  return <svg {...s}><path d="M20 6 9 17l-5-5" {...p} /></svg>;
}

export function XIcon() {
  return <svg {...s}><path d="M18 6 6 18M6 6l12 12" {...p} /></svg>;
}

export function ChevronDownIcon() {
  return <svg {...s}><path d="m6 9 6 6 6-6" {...p} /></svg>;
}

export function ChevronRightIcon() {
  return <svg {...s}><path d="m9 18 6-6-6-6" {...p} /></svg>;
}

export function BrainIcon() {
  return <svg {...s}><path d="M9.5 2A5.5 5.5 0 0 0 5 9.13V20a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-5.5" {...p} /><path d="M14.5 2A5.5 5.5 0 0 1 19 9.13V20a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-5.5" {...p} /></svg>;
}

export function MoonIcon() {
  return <svg {...s}><path d="M16.7 15.8A7.6 7.6 0 0 1 10 4.9a8.4 8.4 0 1 0 9.1 10.4 6.8 6.8 0 0 1-2.4.5Z" {...p} /></svg>;
}

export function SunIcon() {
  return <svg {...s}><circle cx="12" cy="12" r="4.1" {...p} /><path d="M12 2.8v2.3M12 18.9v2.3M21.2 12h-2.3M5.1 12H2.8M18.5 5.5l-1.6 1.6M7.1 16.9l-1.6 1.6M18.5 18.5l-1.6-1.6M7.1 7.1 5.5 5.5" {...p} /></svg>;
}

export function DropletIcon() {
  return <svg {...s}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0Z" {...p} /></svg>;
}

export function PillIcon() {
  return <svg {...s}><path d="m10.5 1.5 3 3-8 8a4.24 4.24 0 1 1-3-3l8-8Z" {...p} /><path d="m6.5 9.5 3-3" {...p} /></svg>;
}

export function FlameIcon() {
  return <svg {...s}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14 0-5.5 2-6.5 0 3.5 2.56 5.5 4 6.5 2.36 1.64 3 3.5 3 6a6 6 0 0 1-12 0c0-1.5.5-3 1.5-4.5" {...p} /></svg>;
}

export function ZapIcon() {
  return <svg {...s}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" {...p} /></svg>;
}

export function TrendUpIcon() {
  return <svg {...s}><path d="M23 6l-9.5 9.5-5-5L1 18" {...p} /><path d="M17 6h6v6" {...p} /></svg>;
}

export function CalendarIcon() {
  return <svg {...s}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" {...p} /><path d="M16 2v4M8 2v4M3 10h18" {...p} /></svg>;
}

export function PlayIcon() {
  return <svg {...s}><polygon points="5,3 19,12 5,21" {...p} /></svg>;
}

export function PauseIcon() {
  return <svg {...s}><rect x="6" y="4" width="4" height="16" {...p} /><rect x="14" y="4" width="4" height="16" {...p} /></svg>;
}

export function SkipIcon() {
  return <svg {...s}><polygon points="5,4 15,12 5,20" {...p} /><line x1="19" y1="5" x2="19" y2="19" {...p} /></svg>;
}

export function ResetIcon() {
  return <svg {...s}><path d="M1 4v6h6M23 20v-6h-6" {...p} /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" {...p} /></svg>;
}

export function StarIcon({ filled }: { filled?: boolean }) {
  return <svg {...s}><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" fill={filled ? 'currentColor' : 'none'} /></svg>;
}

export function ArrowLeftIcon() {
  return <svg {...s}><path d="M19 12H5M12 19l-7-7 7-7" {...p} /></svg>;
}

export function BellIcon() {
  return <svg {...s}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" {...p} /></svg>;
}

export function SparklesIcon() {
  return <svg {...s}><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" {...p} /></svg>;
}

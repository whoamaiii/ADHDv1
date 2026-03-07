# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ADHD Companion is a personal ADHD task tracker and health tracker PWA designed for iPhone 17 Pro Max. Features a luxury liquid gold UI design system with metallic effects, glassmorphism, and smooth animations.

## Key Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server (port 5173)
npm run build     # Build for production
npm run preview   # Preview production build
```

## Architecture

### Tech Stack
- React 19 + TypeScript
- Vite 6
- Pure CSS design system (liquid gold theme)
- localStorage for all persistence
- PWA-ready (manifest.json, standalone mode)

### File Structure
```
src/
  App.tsx              # Main app shell with screen routing
  main.tsx             # Entry point
  types.ts             # All TypeScript types
  styles.css           # Complete design system (liquid gold)
  components/
    BottomNav.tsx       # Liquid gold bottom navigation
    Dashboard.tsx       # Home screen with stats overview
    TaskManager.tsx     # ADHD task management + Brain Dump
    HealthTracker.tsx   # Mood, meds, water, sleep, exercise, symptoms
    FocusTimer.tsx      # Pomodoro timer with ADHD tweaks
    Settings.tsx        # App preferences and configuration
  hooks/
    useAppState.ts      # Centralized state management with auto-save
  utils/
    storage.ts          # localStorage helpers, ID generation, date utils
    icons.tsx           # All SVG icons as React components
```

### Navigation
- Tab-based via `TabId` type: dashboard | tasks | health | focus | settings
- State managed in App.tsx, no router needed

### State Management
- Single `useAppState` hook manages all data
- Auto-saves to localStorage on every state change
- Immutable updates with spread operators

### Design System
- CSS custom properties for theming (dark/light)
- Liquid gold active states on nav buttons
- Glassmorphic cards with backdrop-filter
- Gold gradient accents throughout
- Spring-based animations

### Features
- **Tasks**: Priority levels, categories, subtasks, recurrence, brain dump
- **Health**: Mood/energy tracking, medication logging with streaks, water intake, sleep quality, exercise, ADHD symptom tracking, weekly chart
- **Focus**: Pomodoro timer with session tracking, task linking, auto-start options
- **Dashboard**: Daily overview, streaks, quick stats, progress bars
- **Settings**: Theme, timer config, daily goals, symptom management, data management

### PWA Setup
- `manifest.json` in `/public`
- Apple mobile web app meta tags
- Viewport-fit: cover for safe areas
- Standalone display mode

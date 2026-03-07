import React from 'react';
import type { TabId } from '../types';
import { GridIcon, CheckListIcon, HeartIcon, TimerIcon, SettingsIcon } from '../utils/icons';

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'dashboard', label: 'Home', icon: <GridIcon /> },
  { id: 'tasks', label: 'Tasks', icon: <CheckListIcon /> },
  { id: 'health', label: 'Health', icon: <HeartIcon /> },
  { id: 'focus', label: 'Focus', icon: <TimerIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
];

export const BottomNav: React.FC<Props> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="nav-wrap">
      <div className="nav-bar">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`nav-btn ${isActive ? 'active' : ''}`}
              aria-label={tab.label}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="nav-btn-core">
                <span className="nav-btn-glow" />
                <span className="nav-btn-metal">
                  <span className="nav-btn-sheen" />
                  <span className="nav-btn-inner-shadow" />
                  <span className="nav-icon">{tab.icon}</span>
                </span>
              </span>
              <span className="nav-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

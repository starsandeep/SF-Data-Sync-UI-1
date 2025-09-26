import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Types
interface TabConfig {
  id: string;
  label: string;
  route: string;
  icon?: React.ReactNode;
}

interface TabNavigationProps {
  className?: string;
}

// Tab configuration
const tabs: TabConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    route: '/dashboard',
    icon: '📊'
  },
  {
    id: 'data-sync',
    label: 'Data Sync',
    route: '/create-job',
    icon: '🔄'
  },
  {
    id: 'data-quality',
    label: 'Data Quality',
    route: '/data-cleansing',
    icon: '🧹'
  },
  {
    id: 'job-details',
    label: 'Job Details',
    route: '/jobs',
    icon: '💼'
  }
];

export const TabNavigation: React.FC<TabNavigationProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabClick = (route: string) => {
    navigate(route);
  };

  const handleKeyDown = (event: React.KeyboardEvent, route: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigate(route);
    }
  };

  const isActiveTab = (route: string): boolean => {
    return location.pathname === route;
  };

  return (
    <div className={`tab-navigation ${className}`} role="tablist" aria-label="Main navigation tabs">
      <div className="tab-container">
        {tabs.map((tab) => {
          const isActive = isActiveTab(tab.route);

          return (
            <button
              key={tab.id}
              className={`tab-item ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.route)}
              onKeyDown={(e) => handleKeyDown(e, tab.route)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={0}
              type="button"
            >
              {tab.icon && (
                <span className="tab-icon" aria-hidden="true">
                  {tab.icon}
                </span>
              )}
              <span className="tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div className="tab-indicator" />
    </div>
  );
};

export type { TabConfig, TabNavigationProps };
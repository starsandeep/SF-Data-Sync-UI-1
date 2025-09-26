import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';
import { ThemeToggle } from '../common/ThemeToggle';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = "R-DataX",
  subtitle
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleTitleClick = () => {
    navigate('/dashboard');
  };

  return (
    <header className="dashboard-header fixed-header">
      <div className="header-left">
        <div className="header-brand" onClick={handleTitleClick} style={{ cursor: 'pointer' }}>
          <img
            src="/Relanto.png"
            alt="Relanto Logo"
            className="header-logo"
            title="Go to Dashboard"
          />
          <h1
            className="header-title clickable"
            title="Go to Dashboard"
          >
            {title}
          </h1>
        </div>
        <p className="header-subtitle">
          {subtitle || `Welcome back, ${user?.fullName}`}
        </p>
      </div>
      <div className="header-buttons">
        <ThemeToggle />
        <Button variant="outline" onClick={handleSettingsClick}>
          Settings
        </Button>
        <Button variant="secondary" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
};
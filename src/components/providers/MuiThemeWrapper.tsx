import React from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';
import { createMuiTheme } from '../../theme/muiTheme';

interface MuiThemeWrapperProps {
  children: React.ReactNode;
}

export const MuiThemeWrapper: React.FC<MuiThemeWrapperProps> = ({ children }) => {
  const { theme } = useTheme();
  const muiTheme = createMuiTheme(theme === 'dark');

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
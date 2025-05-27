import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useTheme();
  const isLightMode = mode === 'light';

  return (
    <Tooltip title={mode === 'dark' ? 'Aydınlık Temaya Geç' : 'Karanlık Temaya Geç'} arrow>
      <IconButton 
        onClick={toggleTheme} 
        color="inherit" 
        aria-label="tema değiştir" 
        sx={{
          transition: 'transform 0.3s ease-in-out',
          color: isLightMode ? 'inherit' : 'white',
          '&:hover': {
            transform: 'rotate(30deg)',
          }
        }}
      >
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle; 
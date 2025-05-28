import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Context için tip tanımlaması
interface ThemeContextType {
  mode: PaletteMode;
  toggleTheme: () => void;
  theme: Theme;
}

// Context oluşturma
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Context Hook
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

// Tema sağlayıcı bileşeni
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Local storage'dan tema tercihini al veya karanlık temayı kullan
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as PaletteMode) || 'dark';
  });

  // Tema değiştirme fonksiyonu
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Tema değiştiğinde local storage'a kaydet
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Tema oluştur
  const theme = createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Aydınlık tema
            primary: {
              main: '#7e57c2', // Mor/Leylak rengi
              light: '#b085f5',
              dark: '#4d2c91',
              contrastText: '#ffffff',
            },
            secondary: {
              main: '#2196f3', // Canlı mavi
              light: '#6ec6ff',
              dark: '#0069c0',
              contrastText: '#ffffff',
            },
            background: {
              default: '#f8f9fa',
              paper: '#ffffff',
            },
            text: {
              primary: '#212121',
              secondary: '#546e7a',
            },
            success: {
              main: '#4caf50',
              light: '#80e27e',
              dark: '#087f23',
            },
            info: {
              main: '#00bcd4',
              light: '#62efff',
              dark: '#008ba3',
            },
            warning: {
              main: '#ff9800',
              light: '#ffc947',
              dark: '#c66900',
            },
            error: {
              main: '#f44336',
              light: '#ff7961',
              dark: '#ba000d',
            },
          }
        : {
            // Karanlık tema
            primary: {
              main: '#9575cd', // Mor/Leylak rengi
              light: '#c7a4ff',
              dark: '#65499c',
              contrastText: '#ffffff',
            },
            secondary: {
              main: '#64b5f6', // Mavi
              light: '#9be7ff',
              dark: '#2286c3',
              contrastText: '#000000',
            },
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
            text: {
              primary: '#ffffff',
              secondary: '#b0bec5',
            },
            success: {
              main: '#66bb6a',
              light: '#98ee99',
              dark: '#338a3e',
            },
            info: {
              main: '#26c6da',
              light: '#6ff9ff',
              dark: '#0095a8',
            },
            warning: {
              main: '#ffb74d',
              light: '#ffe97d',
              dark: '#c88719',
            },
            error: {
              main: '#ef5350',
              light: '#ff867c',
              dark: '#b61827',
            },
          }),
    },
    typography: {
      fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      h1: {
        fontWeight: 800,
        fontSize: '2.5rem',
        letterSpacing: '-0.01562em',
      },
      h2: {
        fontWeight: 700,
        fontSize: '2rem',
        letterSpacing: '-0.00833em',
      },
      h3: {
        fontWeight: 700,
        fontSize: '1.75rem',
        letterSpacing: '0em',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        letterSpacing: '0.00735em',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
        letterSpacing: '0em',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        letterSpacing: '0.0075em',
      },
      subtitle1: {
        fontWeight: 500,
        fontSize: '1rem',
        letterSpacing: '0.00938em',
      },
      subtitle2: {
        fontWeight: 500,
        fontSize: '0.875rem',
        letterSpacing: '0.00714em',
      },
      body1: {
        fontWeight: 400,
        fontSize: '1rem',
        letterSpacing: '0.00938em',
      },
      body2: {
        fontWeight: 400,
        fontSize: '0.875rem',
        letterSpacing: '0.01071em',
      },
      button: {
        fontWeight: 500,
        fontSize: '0.875rem',
        letterSpacing: '0.02857em',
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'light' 
              ? '0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)' 
              : '0 8px 24px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
            overflow: 'hidden',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
          elevation1: {
            boxShadow: mode === 'light'
              ? '0 2px 8px rgba(0,0,0,0.08)'
              : '0 2px 8px rgba(0,0,0,0.3)',
          },
          elevation2: {
            boxShadow: mode === 'light'
              ? '0 4px 12px rgba(0,0,0,0.1)'
              : '0 4px 12px rgba(0,0,0,0.4)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light'
              ? '0 2px 10px rgba(0,0,0,0.1)'
              : '0 2px 10px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 
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
              main: '#9c27b0', // Mor
              light: '#bb86fc',
              dark: '#6a0080',
            },
            secondary: {
              main: '#03dac6', // Aksan renk
              light: '#66fff9',
              dark: '#00a896',
            },
            background: {
              default: '#f5f5f5',
              paper: '#ffffff',
            },
            text: {
              primary: '#212121', // Koyu metin rengi
              secondary: '#424242', // Koyu ikincil metin
            },
          }
        : {
            // Karanlık tema
            primary: {
              main: '#9c27b0', // Mor
              light: '#bb86fc',
              dark: '#6a0080',
            },
            secondary: {
              main: '#03dac6', // Aksan renk
              light: '#66fff9',
              dark: '#00a896',
            },
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
            text: {
              primary: '#ffffff',
              secondary: '#b0b0b0',
            },
            error: {
              main: '#cf6679',
            },
          }),
    },
    typography: {
      fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 600,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
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
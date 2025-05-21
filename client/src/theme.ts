import { createTheme, type ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    customColors: {
      incomeGreen: string;
      expenseRed: string;
    }
  }
  interface ThemeOptions {
    customColors?: {
      incomeGreen?: string;
      expenseRed?: string;
    }
  }
}

const baseThemeOptions: ThemeOptions = {
  customColors: {
    incomeGreen: '#2E7D32',
    expenseRed: '#D32F2F'
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', sans-serif",
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        }
      }
    }
  }
};

export const lightTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    mode: 'light',
    primary: { main: '#3f51b5' },
    secondary: { main: '#f50057' },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff'
    }
  }
});

export const darkTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    mode: 'dark',
    primary: { main: '#5c6bc0' },
    secondary: { main: '#ff4081' },
    background: {
      default: '#121212',
      paper: '#1e1e1e'
    }
  }
});
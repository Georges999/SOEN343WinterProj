export const colors = {
    primary: {
      main: '#4a90e2',
      light: '#7cbaf8',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9c27b0', 
      light: '#d05ce3',
      dark: '#6a0080',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4CAF50',
      light: '#81c784',
      dark: '#388e3c',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#9e9e9e',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
      light: '#f9f9f9',
      accent: '#e3f2fd',
    },
  }
  
  export const spacing = {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    xxl: '3rem',      // 48px
  }
  
  export const shadows = {
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    lg: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
    xl: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
    inset: 'inset 0 2px 4px rgba(0,0,0,0.05)',
  }
  
  export const borderRadius = {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    round: '50%',
  }
  
  export const transitions = {
    fast: 'all 0.2s ease',
    medium: 'all 0.3s ease',
    slow: 'all 0.5s ease',
    button: 'transform 0.15s ease, box-shadow 0.15s ease, background-color 0.2s ease',
  }
  
  export const typography = {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    subtitle: {
      fontSize: '1.1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#666666',
    },
    body: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    small: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  }
  
  export const zIndex = {
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  }
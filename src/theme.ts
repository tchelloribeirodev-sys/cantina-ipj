import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#3157D5',
      dark: '#2445B2',
      light: '#EAF0FF',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F6F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#172033',
      secondary: '#667085',
    },
    error: {
      main: '#D92D20',
    },
    success: {
      main: '#16803C',
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#FAFBFC',
          color: '#667085',
          fontWeight: 700,
          fontSize: 12,
        },
      },
    },
  },
});
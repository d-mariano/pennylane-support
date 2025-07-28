import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box,
  Button,
} from '@mui/material';
import { ChallengeList } from './components/ChallengeList';
import { ChallengeDetail } from './components/ChallengeDetail';
import { ConversationDetail } from './components/ConversationDetail';
import { ConversationsList } from './components/ConversationsList';

// Extend the theme with custom properties
declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      drawerWidth: number;
    };
  }
  interface ThemeOptions {
    custom?: {
      drawerWidth?: number;
    };
  }
}

// Create a theme instance
const theme = createTheme({
  custom: {
    drawerWidth: 240,
  },
  palette: {
    primary: {
      main: '#1976d2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.2,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem',
      lineHeight: 1.2,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          transition: 'box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="default" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              PennyLane Support
            </Typography>
            <Button color="inherit" component={Link} to="/">Challenges</Button>
            <Button color="inherit" component={Link} to="/conversations">My Conversations</Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<ChallengeList />} />
            <Route path="/challenges/:id" element={<ChallengeDetail />} />
            <Route path="/conversations" element={<ConversationsList />} />
            <Route path="/conversations/:conversationId" element={<ConversationDetail />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Container>
        <Box component="footer" sx={{ py: 3, backgroundColor: 'background.paper', mt: 'auto' }}>
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" align="center">
              {new Date().getFullYear()} PennyLane Support Platform
            </Typography>
          </Container>
        </Box>
    </ThemeProvider>
  );
}

export default App;

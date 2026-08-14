import { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CircularProgress, Typography, CssBaseline } from '@mui/material';
import { AppLayout, type NavKey } from './components/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { ProductsPage } from './pages/ProductsPage';
import { ContasPage } from './pages/AccountsPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { SettlementsPage } from './pages/SettlementsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { logout, restoreSession } from './services/authService';
import { theme } from './theme';
import type { Usuario } from './types/user';

function EmConstrucao() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography color="text.secondary">Tela em construção.</Typography>
    </Box>
  );
}

function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [selected, setSelected] = useState<NavKey>('dashboard');

  useEffect(() => {
    restoreSession()
      .then(setUsuario)
      .finally(() => setCheckingSession(false));
  }, []);

  const renderPage = () => {
    switch (selected) {
      case 'dashboard':
        return <DashboardPage />;
      case 'produtos':
        return <ProductsPage />;
      case 'contas':
        return <ContasPage />;
      case 'compras':
        return <PurchasesPage />;
      case 'fechamentos':
        return <SettlementsPage />;
      case 'relatorios':
        return <ReportsPage />;
      default:
        return <EmConstrucao />;
    }
  };

  if (checkingSession) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (!usuario) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginPage onSuccess={setUsuario} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout
        selected={selected}
        onSelect={setSelected}
        usuario={usuario}
        onLogout={() => {
          logout();
          setUsuario(null);
        }}
      >
        {renderPage()}
      </AppLayout>
    </ThemeProvider>
  );
}

export default App;
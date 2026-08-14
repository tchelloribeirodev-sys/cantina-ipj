import { useState, type ReactNode } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  AccountBalanceWalletOutlined,
  AssessmentOutlined,
  Close,
  DashboardOutlined,
  Inventory2Outlined,
  Menu,
  ReceiptLongOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Logo } from './Logo';
import { appConfig } from '../config';
import type { Usuario } from '../types/user';

export type NavKey =
  | 'dashboard'
  | 'produtos'
  | 'contas'
  | 'compras'
  | 'fechamentos'
  | 'relatorios';
  
interface AppLayoutProps {
  children: ReactNode;
  selected: NavKey;
  onSelect: (key: NavKey) => void;
  usuario: Usuario;
  onLogout: () => void;
}

const drawerWidth = 240;

const navigation: { key: NavKey; label: string; icon: ReactNode }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
  { key: 'produtos', label: 'Produtos', icon: <Inventory2Outlined /> },
  { key: 'contas', label: 'Contas', icon: <AccountBalanceWalletOutlined /> },
  { key: 'compras', label: 'Compras', icon: <ShoppingCartOutlined /> },
  { key: 'fechamentos', label: 'Fechamentos', icon: <ReceiptLongOutlined /> },
  { key: 'relatorios', label: 'Relatórios', icon: <AssessmentOutlined /> },  
];

export function AppLayout({ children, selected, onSelect, usuario, onLogout }: AppLayoutProps) {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2.5, py: 3, display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Logo size={38} />
        <Box>
          <Typography fontWeight={800} fontSize={15}>
            {appConfig.nomeSistema}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Gestão de compras
          </Typography>
        </Box>
        {!desktop && (
          <IconButton sx={{ ml: 'auto' }} onClick={() => setMobileOpen(false)}>
            <Close />
          </IconButton>
        )}
      </Box>

      <List sx={{ px: 1.25, py: 0 }}>
        {navigation.map((item) => {
          const active = item.key === selected;
          return (
            <ListItemButton
              key={item.key}
              selected={active}
              onClick={() => {
                onSelect(item.key);
                setMobileOpen(false);
              }}
              sx={{
                mb: 0.5,
                borderRadius: 1.5,
                color: active ? 'primary.main' : 'text.secondary',
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  '&:hover': { bgcolor: 'primary.light' },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 38,
                  color: 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 500 }} />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ mt: 'auto' }}>
        <Divider />
        <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: '#E8EDF7', color: '#53617A', fontSize: 12 }}>
            {usuario.nome.slice(0, 2).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontSize={13} fontWeight={700} noWrap>
              {usuario.nome}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Logado
            </Typography>
          </Box>
          <IconButton size="small" onClick={onLogout} aria-label="Sair">
            <LogoutOutlined fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {!desktop && (
        <AppBar
          position="fixed"
          color="inherit"
          elevation={0}
          sx={{ borderBottom: '1px solid #E7E9EE' }}
        >
          <Toolbar>
            <IconButton edge="start" onClick={() => setMobileOpen(true)}>
              <Menu />
            </IconButton>
            <Typography fontWeight={800} sx={{ ml: 1 }}>
              {navigation.find((item) => item.key === selected)?.label}
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        variant={desktop ? 'permanent' : 'temporary'}
        open={desktop || mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: desktop ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid #E7E9EE',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          pt: { xs: 9, md: 0 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
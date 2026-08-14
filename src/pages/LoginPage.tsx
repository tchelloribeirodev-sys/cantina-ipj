import { useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { LockOutlined, PersonOutline, Visibility, VisibilityOff } from '@mui/icons-material';
import { Logo } from '../components/Logo';
import { appConfig } from '../config';
import { login } from '../services/authService';
import type { Usuario } from '../types/user';

interface LoginPageProps {
  onSuccess: (usuario: Usuario) => void;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!nome.trim() || !senha) {
      setError('Informe usuário e senha.');
      return;
    }

    setLoading(true);
    try {
      const usuario = await login(nome.trim(), senha);
      onSuccess(usuario);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#F6F7FA',
        px: 2,
      }}
    >
      <Paper
        variant="outlined"
        sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 380, borderColor: '#E6E9EF' }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Logo size={56} />
          <Typography variant="h5" fontWeight={800} sx={{ mt: 1.5 }}>
            {appConfig.nomeSistema}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 0.5 }}>
            Entre com seu usuário e senha para continuar.
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Usuário"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            autoFocus
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutline fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Senha"
            type={showSenha ? 'text' : 'password'}
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowSenha((current) => !current)} edge="end">
                    {showSenha ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 1 }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

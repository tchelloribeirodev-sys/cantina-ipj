import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import { ContasTable } from '../components/AccountsTable';
import { ContaForm } from '../components/AccountsForm';
import { createConta, deleteConta, listContas, updateConta } from '../services/accountsService';
import type { Conta, ContaFormData } from '../types/account';
import { getFriendlyErrorMessage } from '../utils/errorMessage';

const CURRENT_YEAR = new Date().getFullYear();

export function ContasPage() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<Conta | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Conta | null>(null);
  const [message, setMessage] = useState('');

  const fetchContas = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await listContas(CURRENT_YEAR);
      setContas(data);
    } catch (err) {
      setLoadError(getFriendlyErrorMessage(err, 'Não foi possível carregar as contas.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContas();
  }, []);

  const filteredContas = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return contas;
    }

    return contas.filter((conta) => {
      return (
        conta.nome.toLowerCase().includes(searchValue) ||
        conta.telefone.includes(searchValue)
      );
    });
  }, [contas, search]);

  const handleNew = (): void => {
    setSelectedConta(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (conta: Conta): void => {
    setSelectedConta(conta);
    setDialogOpen(true);
  };

  const handleDelete = (conta: Conta): void => {
    setDeleteTarget(conta);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteConta(deleteTarget.id);
      setContas((current) => current.filter((item) => item.id !== deleteTarget.id));
      setMessage('Conta excluída com sucesso.');
    } catch (err) {
      setMessage(getFriendlyErrorMessage(err, 'Não foi possível excluir a conta.'));
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSubmit = async (data: ContaFormData): Promise<void> => {
    try {
      if (selectedConta) {
        const updated = await updateConta(selectedConta.id, data);
        setContas((current) => current.map((conta) => (conta.id === updated.id ? updated : conta)));
        setMessage('Conta atualizada com sucesso.');
      } else {
        const created = await createConta(data, CURRENT_YEAR);
        setContas((current) => [...current, created]);
        setMessage('Conta cadastrada com sucesso.');
      }

      setDialogOpen(false);
      setSelectedConta(undefined);
    } catch (err) {
      setMessage(getFriendlyErrorMessage(err, 'Não foi possível salvar a conta.'));
    }
  };

  const handleCancel = (): void => {
    setDialogOpen(false);
    setSelectedConta(undefined);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 4 },
        maxWidth: 1500,
        mx: 'auto',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'flex-end' }}
        gap={2}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            Cadastros / Contas
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.5 }}>
            Contas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Cadastre e gerencie as contas de {CURRENT_YEAR}.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNew}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Nova Conta
        </Button>
      </Stack>

      {loadError && (
        <Alert severity="error" action={<Button onClick={fetchContas}>Tentar novamente</Button>}>
          {loadError}
        </Alert>
      )}

      <TextField
        label="Pesquisar"
        placeholder="Nome ou telefone"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        fullWidth
      />

      {loading ? (
        <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <>
          <ContasTable contas={filteredContas} onEdit={handleEdit} onDelete={handleDelete} />

          <Typography variant="body2" color="text.secondary">
            {filteredContas.length} {filteredContas.length === 1 ? 'conta encontrada' : 'contas encontradas'}
          </Typography>
        </>
      )}

      <Dialog open={dialogOpen} onClose={handleCancel} fullWidth maxWidth="sm">
        <DialogTitle>{selectedConta ? 'Editar Conta' : 'Nova Conta'}</DialogTitle>

        <ContaForm conta={selectedConta} onSubmit={handleSubmit} onCancel={handleCancel} />
      </Dialog>

      <Snackbar
        open={Boolean(deleteTarget)}
        autoHideDuration={null}
        onClose={() => setDeleteTarget(null)}
      >
        <Alert
          severity="warning"
          variant="filled"
          action={
            <Stack direction="row">
              <Button color="inherit" size="small" onClick={confirmDelete}>
                Excluir
              </Button>
              <Button color="inherit" size="small" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
            </Stack>
          }
        >
          Excluir a conta "{deleteTarget?.nome}"?
        </Alert>
      </Snackbar>

      <Snackbar open={Boolean(message)} autoHideDuration={3000} onClose={() => setMessage('')} message={message} />
    </Box>
  );
}

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { CheckCircle, WhatsApp } from '@mui/icons-material';
import { getConsumoByConta } from '../services/purchasesService';
import { getFriendlyErrorMessage } from '../utils/errorMessage';
import { buildCobrancaMessage, buildWhatsappLink } from '../utils/whatsappMessage';
import type { Conta } from '../types/account';

interface PendingAccount {
  conta: Conta;
  saldo: number;
}

interface BatchChargeDialogProps {
  open: boolean;
  pendentes: PendingAccount[];
  onClose: () => void;
}

const money = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// O WhatsApp não tem uma forma de disparar várias mensagens de uma vez sem
// usar a API Business (paga); o que dá pra fazer é abrir uma conversa de
// cada vez. Este modal deixa isso rápido: uma lista das contas pendentes,
// cada uma com seu próprio botão "Enviar" (que já busca o consumo daquela
// conta e monta a mensagem), marcando como enviada conforme você avança.
export function BatchChargeDialog({ open, pendentes, onClose }: BatchChargeDialogProps) {
  const [sentIds, setSentIds] = useState<Set<number>>(new Set());
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setSentIds(new Set());
      setError('');
    }
  }, [open]);

  const handleSend = async (conta: Conta, saldo: number) => {
    setError('');
    setLoadingId(conta.id);
    try {
      const consumo = await getConsumoByConta(conta.id);
      const message = buildCobrancaMessage(conta.nome, consumo, saldo);
      window.open(buildWhatsappLink(conta.telefone, message), '_blank', 'noopener,noreferrer');
      setSentIds((current) => new Set(current).add(conta.id));
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Não foi possível montar a mensagem dessa conta.'));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6">Cobrança em lote</Typography>
        <Typography variant="body2" color="text.secondary">
          Clique em "Enviar" para abrir o WhatsApp de cada conta pendente, uma de cada vez.
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {pendentes.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography fontWeight={700}>Nenhuma conta pendente 🎉</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Todas as contas já estão quitadas.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {pendentes.map(({ conta, saldo }) => {
              const sent = sentIds.has(conta.id);
              const loading = loadingId === conta.id;

              return (
                <ListItem
                  key={conta.id}
                  disableGutters
                  divider
                  secondaryAction={
                    <Button
                      size="small"
                      variant={sent ? 'outlined' : 'contained'}
                      color={sent ? 'success' : 'primary'}
                      startIcon={sent ? <CheckCircle fontSize="small" /> : <WhatsApp fontSize="small" />}
                      onClick={() => handleSend(conta, saldo)}
                      disabled={loading}
                    >
                      {loading ? '...' : sent ? 'Enviado' : 'Enviar'}
                    </Button>
                  }
                >
                  <ListItemText
                    primary={conta.nome}
                    secondary={`Saldo em aberto: ${money(saldo)}`}
                    sx={{ pr: 12 }}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5, justifyContent: 'space-between' }}>
        <Chip
          size="small"
          label={`${sentIds.size} de ${pendentes.length} enviadas`}
          sx={{ bgcolor: '#EEF1FC', fontWeight: 700 }}
        />
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}

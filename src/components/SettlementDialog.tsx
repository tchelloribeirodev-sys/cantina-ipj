import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { WhatsApp } from '@mui/icons-material';
import type { Conta } from '../types/account';
import type { FechamentoFormData } from '../types/settlement';
import type { ConsumoItem } from '../services/purchasesService';
import { formatCurrencyValue, maskCurrencyInput, parseCurrencyInput } from '../utils/currencyInput';
import { buildCobrancaMessage, buildWhatsappLink } from '../utils/whatsappMessage';

interface SettlementDialogProps {
  open: boolean;
  conta: Conta | null;
  total: number;
  valorPagoAtual: number;
  observacaoAtual: string;
  consumo: ConsumoItem[];
  consumoLoading?: boolean;
  onClose: () => void;
  onSave: (data: FechamentoFormData) => void;
}

const money = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function SettlementDialog({
  open,
  conta,
  total,
  valorPagoAtual,
  observacaoAtual,
  consumo,
  consumoLoading,
  onClose,
  onSave,
}: SettlementDialogProps) {
  const [valorPago, setValorPago] = useState('');
  const [observacao, setObservacao] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setValorPago(valorPagoAtual ? formatCurrencyValue(valorPagoAtual) : '');
    setObservacao(observacaoAtual ?? '');
    setError('');
  }, [open, valorPagoAtual, observacaoAtual]);

  if (!conta) return null;

  const numericValorPago = parseCurrencyInput(valorPago);
  const saldo = total - numericValorPago;

  const handleSubmit = () => {
    if (!Number.isFinite(numericValorPago) || numericValorPago < 0) {
      setError('Informe um valor pago válido.');
      return;
    }

    onSave({
      contaId: conta.id,
      valorPago: numericValorPago,
      observacao: observacao.trim(),
    });
  };

  const handleWhatsapp = () => {
    const message = buildCobrancaMessage(conta.nome, consumo, saldo, observacao);
    window.open(buildWhatsappLink(conta.telefone, message), '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6">Fechamento</Typography>
        <Typography variant="body2" color="text.secondary">
          Lance o valor pago e envie a cobrança pelo WhatsApp, se necessário.
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.2} sx={{ pt: 0.5 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField label="Conta" value={conta.nome} disabled fullWidth />

          <TextField
            label="Valor total"
            value={money(total)}
            disabled
            fullWidth
          />

          <TextField
            label="Valor pago"
            required
            value={valorPago}
            onChange={(event) => setValorPago(maskCurrencyInput(event.target.value))}
            placeholder="0,00"
            InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            }}
            inputMode="decimal"
            fullWidth
          />

          <Box>
            <Typography
              variant="body2"
              fontWeight={700}
              color={saldo <= 0 ? 'success.main' : 'error.main'}
            >
              Saldo: {money(saldo)} {saldo <= 0 ? '(quitado)' : '(em aberto)'}
            </Typography>
          </Box>

          <TextField
            label="Observação"
            value={observacao}
            onChange={(event) => setObservacao(event.target.value)}
            placeholder="Ex.: pago parcialmente, combinado para o dia 10..."
            multiline
            minRows={3}
            fullWidth
          />

          <Box>
            <Typography variant="body2" fontWeight={700} mb={0.75}>
              Prévia da mensagem de WhatsApp
            </Typography>

            {consumoLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={20} />
              </Box>
            ) : (
              <Box
                sx={{
                  border: '1px solid #E1E5EC',
                  borderRadius: 2,
                  bgcolor: '#FAFBFC',
                  p: 1.5,
                  fontSize: 13,
                  whiteSpace: 'pre-wrap',
                  color: 'text.secondary',
                  maxHeight: 180,
                  overflowY: 'auto',
                }}
              >
                {consumo.length === 0
                  ? 'Nenhum consumo encontrado para esta conta.'
                  : buildCobrancaMessage(conta.nome, consumo, saldo, observacao)}
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button
          color="success"
          startIcon={<WhatsApp />}
          onClick={handleWhatsapp}
          disabled={!conta.telefone || consumoLoading}
        >
          Enviar WhatsApp
        </Button>

        <Stack direction="row" spacing={1}>
          <Button color="inherit" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Salvar
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { CheckCircle, EditOutlined, RadioButtonUncheckedOutlined, SearchOutlined, WhatsApp } from '@mui/icons-material';
import { BatchChargeDialog } from '../components/BatchChargeDialog';
import { SettlementDialog } from '../components/SettlementDialog';
import { listContas } from '../services/accountsService';
import { getConsumoByConta, getTotalsByConta } from '../services/purchasesService';
import { listFechamentos, saveFechamento } from '../services/settlementsService';
import type { Conta } from '../types/account';
import type { Fechamento, FechamentoFormData } from '../types/settlement';
import type { ConsumoItem } from '../services/purchasesService';
import { getFriendlyErrorMessage } from '../utils/errorMessage';

const currentYear = new Date().getFullYear();

type StatusFilter = 'todas' | 'quitadas' | 'pendentes';

const money = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function SettlementsPage() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [totalsByConta, setTotalsByConta] = useState<Map<number, number>>(new Map());
  const [fechamentos, setFechamentos] = useState<Fechamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('todas');
  const [selectedConta, setSelectedConta] = useState<Conta | null>(null);
  const [consumo, setConsumo] = useState<ConsumoItem[]>([]);
  const [consumoLoading, setConsumoLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [contasData, totals, fechamentosData] = await Promise.all([
        listContas(currentYear),
        getTotalsByConta(),
        listFechamentos(),
      ]);
      setContas(contasData);
      setTotalsByConta(totals);
      setFechamentos(fechamentosData);
    } catch (err) {
      setLoadError(getFriendlyErrorMessage(err, 'Não foi possível carregar os fechamentos.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const rows = useMemo(() => {
    return contas.map((conta) => {
      const total = totalsByConta.get(conta.id) ?? 0;
      const fechamento = fechamentos.find((item) => item.contaId === conta.id);
      const valorPago = fechamento?.valorPago ?? 0;
      const saldo = total - valorPago;
      const quitado = total > 0 && saldo <= 0;

      return { conta, total, valorPago, saldo, quitado, observacao: fechamento?.observacao ?? '' };
    });
  }, [contas, totalsByConta, fechamentos]);

  const filteredRows = rows.filter((row) => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');
    const matchesSearch =
      !normalizedSearch ||
      row.conta.nome.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
      row.conta.telefone.includes(normalizedSearch);

    const matchesStatus =
      status === 'todas' || (status === 'quitadas' ? row.quitado : !row.quitado);

    return matchesSearch && matchesStatus;
  });

  const selectedRow = rows.find((row) => row.conta.id === selectedConta?.id);

  const pendentes = rows
    .filter((row) => row.saldo > 0)
    .sort((a, b) => b.saldo - a.saldo)
    .map((row) => ({ conta: row.conta, saldo: row.saldo }));

  useEffect(() => {
    if (!selectedConta) {
      setConsumo([]);
      return;
    }

    let cancelled = false;
    setConsumoLoading(true);

    getConsumoByConta(selectedConta.id)
      .then((data) => {
        if (!cancelled) setConsumo(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setMessage(getFriendlyErrorMessage(err, 'Não foi possível carregar o consumo da conta.'));
        }
      })
      .finally(() => {
        if (!cancelled) setConsumoLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedConta?.id]);

  const handleSave = async (data: FechamentoFormData) => {
    try {
      const saved = await saveFechamento(data);
      setFechamentos((current) => {
        const exists = current.some((item) => item.contaId === saved.contaId);
        return exists
          ? current.map((item) => (item.contaId === saved.contaId ? saved : item))
          : [...current, saved];
      });
      setMessage('Fechamento salvo com sucesso.');
      setSelectedConta(null);
    } catch (err) {
      setMessage(getFriendlyErrorMessage(err, 'Não foi possível salvar o fechamento.'));
    }
  };

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 4 }, maxWidth: 1500, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'flex-end' }}
        gap={2}
        mb={3}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            Movimentações / Fechamentos
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.5 }}>
            Fechamentos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Acompanhe o total de cada conta, o valor pago e quem já quitou.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="success"
          startIcon={<WhatsApp />}
          onClick={() => setBatchDialogOpen(true)}
          disabled={pendentes.length === 0}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Cobrança em lote {pendentes.length > 0 ? `(${pendentes.length})` : ''}
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, mb: 2, borderColor: '#E6E9EF' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
          <TextField
            size="small"
            label="Buscar por nome ou telefone"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: { md: 220 } }}>
            <InputLabel id="settlement-status-label">Situação</InputLabel>
            <Select
              labelId="settlement-status-label"
              label="Situação"
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
            >
              <MenuItem value="todas">Todas as contas</MenuItem>
              <MenuItem value="quitadas">Somente quitadas</MenuItem>
              <MenuItem value="pendentes">Somente pendentes</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button onClick={fetchData}>Tentar novamente</Button>}>
          {loadError}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderColor: '#E6E9EF' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Conta</TableCell>
                <TableCell width={150}>Valor total</TableCell>
                <TableCell width={150}>Valor pago</TableCell>
                <TableCell width={150}>Saldo</TableCell>
                <TableCell width={110} align="center">
                  Status
                </TableCell>
                <TableCell width={90} align="right">
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRows.map(({ conta, total, valorPago, saldo, quitado }) => (
                <TableRow key={conta.id} hover>
                  <TableCell>
                    <Typography fontSize={14} fontWeight={700}>
                      {conta.nome}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {conta.telefone}
                    </Typography>
                  </TableCell>

                  <TableCell>{money(total)}</TableCell>

                  <TableCell>{money(valorPago)}</TableCell>

                  <TableCell>
                    <Typography
                      fontSize={14}
                      fontWeight={700}
                      color={saldo <= 0 ? 'success.main' : 'error.main'}
                    >
                      {money(saldo)}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    {quitado ? (
                      <Tooltip title="Quitado">
                        <CheckCircle color="success" />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Em aberto">
                        <Chip
                          size="small"
                          icon={<RadioButtonUncheckedOutlined fontSize="small" />}
                          label="Pendente"
                          sx={{ bgcolor: '#FDECEC', color: '#B42318', fontWeight: 700 }}
                        />
                      </Tooltip>
                    )}
                  </TableCell>

                  <TableCell align="right">
                    <Tooltip title="Lançar / alterar pagamento">
                      <IconButton size="small" color="primary" onClick={() => setSelectedConta(conta)}>
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}

              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                      <Typography fontWeight={700}>Nenhuma conta encontrada</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Ajuste a busca ou a situação filtrada para ver resultados.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <SettlementDialog
        open={Boolean(selectedConta)}
        conta={selectedConta}
        total={selectedRow?.total ?? 0}
        valorPagoAtual={selectedRow?.valorPago ?? 0}
        observacaoAtual={selectedRow?.observacao ?? ''}
        consumo={consumo}
        consumoLoading={consumoLoading}
        onClose={() => setSelectedConta(null)}
        onSave={handleSave}
      />

      <Snackbar open={Boolean(message)} autoHideDuration={3000} onClose={() => setMessage('')} message={message} />

      <BatchChargeDialog
        open={batchDialogOpen}
        pendentes={pendentes}
        onClose={() => setBatchDialogOpen(false)}
      />
    </Box>
  );
}

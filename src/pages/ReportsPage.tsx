import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { CheckCircle, RadioButtonUncheckedOutlined } from '@mui/icons-material';
import { listContas, listDistinctYears } from '../services/accountsService';
import { getTotalsByConta } from '../services/purchasesService';
import { listFechamentos } from '../services/settlementsService';
import { getFriendlyErrorMessage } from '../utils/errorMessage';

const currentYear = new Date().getFullYear();

type StatusFilter = 'todas' | 'quitadas' | 'pendentes';

const money = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface Linha {
  conta: { id: number; nome: string; telefone: string };
  total: number;
  valorPago: number;
  saldo: number;
  quitado: boolean;
}

export function ReportsPage() {
  const [ano, setAno] = useState(currentYear);
  const [status, setStatus] = useState<StatusFilter>('todas');
  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([]);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    listDistinctYears()
      .then((years) => setAnosDisponiveis(years.includes(currentYear) ? years : [currentYear, ...years]))
      .catch(() => setAnosDisponiveis([currentYear]));
  }, []);

  const fetchLinhas = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [contas, totalsByConta, fechamentos] = await Promise.all([
        listContas(ano),
        getTotalsByConta(),
        listFechamentos(),
      ]);

      const rows = contas.map((conta) => {
        const total = totalsByConta.get(conta.id) ?? 0;
        const valorPago = fechamentos.find((item) => item.contaId === conta.id)?.valorPago ?? 0;
        const saldo = total - valorPago;
        const quitado = total > 0 && saldo <= 0;

        return { conta, total, valorPago, saldo, quitado };
      });

      setLinhas(rows);
    } catch (err) {
      setLoadError(getFriendlyErrorMessage(err, 'Não foi possível carregar o relatório.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinhas();
  }, [ano]);

  const linhasFiltradas = linhas.filter((linha) => {
    if (status === 'quitadas') return linha.quitado;
    if (status === 'pendentes') return !linha.quitado;
    return true;
  });

  const totalGeral = linhasFiltradas.reduce((sum, linha) => sum + linha.total, 0);
  const totalPago = linhasFiltradas.reduce((sum, linha) => sum + linha.valorPago, 0);
  const totalEmAberto = totalGeral - totalPago;

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 4 }, maxWidth: 1500, mx: 'auto' }}>
      <Box mb={3}>
        <Typography variant="body2" color="text.secondary">
          Movimentações / Relatórios
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.5 }}>
          Relatórios
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Consulte o total de cada conta por ano, filtrando por contas quitadas ou pendentes.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, mb: 2, borderColor: '#E6E9EF' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
          <TextField
            label="Ano"
            type="number"
            size="small"
            value={ano}
            onChange={(event) => setAno(Number(event.target.value) || currentYear)}
            sx={{ minWidth: { md: 150 } }}
          />

          <FormControl size="small" sx={{ minWidth: { md: 220 } }}>
            <InputLabel id="status-label">Situação</InputLabel>
            <Select
              labelId="status-label"
              label="Situação"
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
            >
              <MenuItem value="todas">Todas as contas</MenuItem>
              <MenuItem value="quitadas">Somente quitadas</MenuItem>
              <MenuItem value="pendentes">Somente pendentes</MenuItem>
            </Select>
          </FormControl>

          {anosDisponiveis.length > 0 && (
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ ml: { md: 'auto' } }}>
              <Typography variant="caption" color="text.secondary">
                Anos com contas cadastradas:
              </Typography>
              {anosDisponiveis.map((value) => (
                <Chip
                  key={value}
                  label={value}
                  size="small"
                  onClick={() => setAno(value)}
                  color={value === ano ? 'primary' : 'default'}
                  variant={value === ano ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button onClick={fetchLinhas}>Tentar novamente</Button>}>
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
                <TableCell width={130} align="center">
                  Situação
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {linhasFiltradas.map(({ conta, total, valorPago, saldo, quitado }) => (
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
                    <Typography fontSize={14} fontWeight={700} color={saldo <= 0 ? 'success.main' : 'error.main'}>
                      {money(saldo)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {quitado ? (
                      <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" color="success.main">
                        <CheckCircle fontSize="small" />
                        <Typography variant="caption" fontWeight={700}>
                          Quitada
                        </Typography>
                      </Stack>
                    ) : (
                      <Chip
                        size="small"
                        icon={<RadioButtonUncheckedOutlined fontSize="small" />}
                        label="Pendente"
                        sx={{ bgcolor: '#FDECEC', color: '#B42318', fontWeight: 700 }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {linhasFiltradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                      <Typography fontWeight={700}>Nenhuma conta encontrada</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Ajuste o ano ou a situação filtrada para ver resultados.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            {linhasFiltradas.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Total ({linhasFiltradas.length})</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{money(totalGeral)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{money(totalPago)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} colSpan={2}>
                    {money(totalEmAberto)} em aberto
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

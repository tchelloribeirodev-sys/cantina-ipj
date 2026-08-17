import { useEffect, useState, type ReactNode } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Grid, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import {
  AccountBalanceWalletOutlined,
  CheckCircle,
  Inventory2Outlined,
  PaidOutlined,
  PeopleAltOutlined,
  ReceiptLongOutlined,
  RefreshOutlined,
  ShoppingCartOutlined,
  TrendingUpOutlined,
} from '@mui/icons-material';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { listContas } from '../services/accountsService';
import { listProducts } from '../services/productsService';
import { countPurchases, getTotalsByConta, listRecentPurchases } from '../services/purchasesService';
import { listFechamentos } from '../services/settlementsService';
import type { Conta } from '../types/account';
import type { Purchase } from '../types/purchase';
import { getFriendlyErrorMessage } from '../utils/errorMessage';

const currentYear = new Date().getFullYear();

const money = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface KpiCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  helper?: string;
  color: string;
}

function KpiCard({ icon, label, value, helper, color }: KpiCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderColor: '#E6E9EF', height: '100%' }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            bgcolor: color,
            color: 'white',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={800} sx={{ mt: 0.25 }}>
            {value}
          </Typography>
          {helper && (
            <Typography variant="caption" color="text.secondary">
              {helper}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

interface DashboardData {
  contas: Conta[];
  productCount: number;
  purchaseCount: number;
  totalsByConta: Map<number, number>;
  valorPagoByConta: Map<number, number>;
  ultimasCompras: Purchase[];
}

export function DashboardPage() {
  const isOnline = useOnlineStatus();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setLoadError('');
    try {
      const [contas, products, purchaseCount, totalsByConta, fechamentos, ultimasCompras] = await Promise.all([
        listContas(currentYear),
        listProducts(currentYear),
        countPurchases(),
        getTotalsByConta(),
        listFechamentos(),
        listRecentPurchases(5),
      ]);

      const valorPagoByConta = new Map<number, number>();
      fechamentos.forEach((item) => valorPagoByConta.set(item.contaId, item.valorPago));

      setData({
        contas,
        productCount: products.length,
        purchaseCount,
        totalsByConta,
        valorPagoByConta,
        ultimasCompras,
      });
      setLastUpdated(new Date());
    } catch (err) {
      setLoadError(getFriendlyErrorMessage(err, 'Não foi possível carregar o dashboard.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 4 }, maxWidth: 1500, mx: 'auto' }}>
        {loadError ? (
          <Alert severity="error" action={<Button onClick={() => fetchData()}>Tentar novamente</Button>}>
            {loadError}
          </Alert>
        ) : (
          <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={28} />
          </Box>
        )}
      </Box>
    );
  }

  const { contas, productCount, purchaseCount, totalsByConta, valorPagoByConta, ultimasCompras } = data;

  const rows = contas.map((conta) => {
    const total = totalsByConta.get(conta.id) ?? 0;
    const valorPago = valorPagoByConta.get(conta.id) ?? 0;
    const saldo = total - valorPago;
    const quitado = total > 0 && saldo <= 0;
    return { conta, total, valorPago, saldo, quitado };
  });

  const totalGeral = rows.reduce((sum, row) => sum + row.total, 0);
  const totalPago = rows.reduce((sum, row) => sum + row.valorPago, 0);
  const totalEmAberto = totalGeral - totalPago;
  const contasQuitadas = rows.filter((row) => row.quitado).length;

  const contasPendentes = rows
    .filter((row) => row.saldo > 0)
    .sort((a, b) => b.saldo - a.saldo)
    .slice(0, 5);

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 4 }, maxWidth: 1500, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
        gap={1.5}
        mb={3}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            Início / Dashboard
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.5 }}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Visão geral de {currentYear}. Estes são exemplos de indicadores — outros podem ser adicionados
            conforme a necessidade.
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" spacing={1}>
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary">
              Atualizado às{' '}
              {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          )}
          <Tooltip title={isOnline ? 'Atualizar' : 'Sem conexão'}>
            <span>
              <IconButton
                onClick={() => fetchData(true)}
                disabled={refreshing || !isOnline}
                size="small"
                sx={{ border: '1px solid #E1E5EC' }}
              >
                {refreshing ? <CircularProgress size={16} /> : <RefreshOutlined fontSize="small" />}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KpiCard
            icon={<PeopleAltOutlined />}
            label="Contas cadastradas"
            value={String(contas.length)}
            helper={`em ${currentYear}`}
            color="#3157D5"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KpiCard
            icon={<Inventory2Outlined />}
            label="Produtos ativos"
            value={String(productCount)}
            helper={`catálogo de ${currentYear}`}
            color="#0EA5E9"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KpiCard
            icon={<ShoppingCartOutlined />}
            label="Compras registradas"
            value={String(purchaseCount)}
            helper={
              purchaseCount > 0 ? `ticket médio de ${money(totalGeral / purchaseCount)}` : 'nenhuma compra ainda'
            }
            color="#7C3AED"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KpiCard
            icon={<PaidOutlined />}
            label="Total comprado"
            value={money(totalGeral)}
            helper={`em ${purchaseCount} ${purchaseCount === 1 ? 'compra' : 'compras'}`}
            color="#B45309"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KpiCard
            icon={<ReceiptLongOutlined />}
            label="Saldo em aberto"
            value={money(totalEmAberto)}
            helper={`${money(totalPago)} já pago`}
            color={totalEmAberto > 0 ? '#D92D20' : '#16803C'}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderColor: '#E6E9EF', height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <TrendingUpOutlined color="primary" fontSize="small" />
              <Typography fontWeight={700}>Últimas compras</Typography>
            </Stack>

            <Stack spacing={1.5} divider={<Box sx={{ borderBottom: '1px solid #F0F1F4' }} />}>
              {ultimasCompras.map((purchase) => (
                <Stack key={purchase.id} direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontSize={14} fontWeight={700}>
                      {purchase.contaNome}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {purchase.items.length} {purchase.items.length === 1 ? 'item' : 'itens'} •{' '}
                      {new Date(purchase.createdAt).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Box>
                  <Typography fontWeight={700} color="success.main">
                    {money(purchase.total)}
                  </Typography>
                </Stack>
              ))}

              {ultimasCompras.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Nenhuma compra registrada ainda.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderColor: '#E6E9EF', height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <AccountBalanceWalletOutlined color="error" fontSize="small" />
              <Typography fontWeight={700}>Maiores saldos em aberto</Typography>
            </Stack>

            <Stack spacing={1.5} divider={<Box sx={{ borderBottom: '1px solid #F0F1F4' }} />}>
              {contasPendentes.map(({ conta, saldo }) => (
                <Stack key={conta.id} direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontSize={14} fontWeight={700}>
                    {conta.nome}
                  </Typography>
                  <Typography fontWeight={700} color="error.main">
                    {money(saldo)}
                  </Typography>
                </Stack>
              ))}

              {contasPendentes.length === 0 && (
                <Stack direction="row" spacing={1} alignItems="center" color="success.main">
                  <CheckCircle fontSize="small" />
                  <Typography variant="body2">Todas as contas estão quitadas.</Typography>
                </Stack>
              )}
            </Stack>

            <Box mt={2}>
              <Chip
                size="small"
                label={`${contasQuitadas} de ${contas.length} contas quitadas`}
                sx={{ bgcolor: '#EAF7EE', color: '#16803C', fontWeight: 700 }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

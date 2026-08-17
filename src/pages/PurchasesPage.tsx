import { useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { AddShoppingCartOutlined, CheckCircleOutline, WifiOffOutlined } from '@mui/icons-material';
import { PurchaseCartTable } from '../components/PurchaseCartTable';
import { PurchaseHistoryTable } from '../components/PurchaseHistoryTable';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { listContas } from '../services/accountsService';
import { listProducts } from '../services/productsService';
import { createPurchase, listPurchases } from '../services/purchasesService';
import { getFriendlyErrorMessage } from '../utils/errorMessage';
import type { Conta } from '../types/account';
import type { Product } from '../types/product';
import type { PurchaseDraftItem, Purchase } from '../types/purchase';

const currentYear = new Date().getFullYear();

const money = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// A compra em andamento (conta + itens) é salva no navegador enquanto o
// usuário monta o carrinho. Isso evita perder tudo se a página recarregar,
// a conexão cair no meio do processo, ou o usuário trocar de tela sem
// querer — bem comum em local com internet instável.
const DRAFT_STORAGE_KEY = 'cantina.purchaseDraft';

interface PurchaseDraft {
  contaId: number;
  items: { productId: number; quantity: number }[];
}

function readDraft(): PurchaseDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PurchaseDraft) : null;
  } catch {
    return null;
  }
}

function writeDraft(draft: PurchaseDraft | null) {
  try {
    if (!draft || (!draft.contaId && draft.items.length === 0)) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // localStorage indisponível (modo privado, por exemplo) — segue sem persistir.
  }
}

export function PurchasesPage() {
  const isOnline = useOnlineStatus();

  const [contas, setContas] = useState<Conta[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingBase, setLoadingBase] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [draftRestored, setDraftRestored] = useState(false);

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [contaId, setContaId] = useState<number | ''>('');
  const [productId, setProductId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<PurchaseDraftItem[]>([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [finalizing, setFinalizing] = useState(false);

  const fetchBaseData = async () => {
    setLoadingBase(true);
    setLoadError('');
    try {
      const [contasData, productsData] = await Promise.all([
        listContas(currentYear),
        listProducts(currentYear),
      ]);
      setContas(contasData);
      setProducts(productsData);
    } catch (err) {
      setLoadError(getFriendlyErrorMessage(err, 'Não foi possível carregar contas e produtos.'));
    } finally {
      setLoadingBase(false);
    }
  };

  useEffect(() => {
    fetchBaseData();
  }, []);

  // Assim que contas e produtos carregam, tenta restaurar uma compra que
  // ficou em andamento (salva no navegador) da última vez.
  useEffect(() => {
    if (loadingBase || draftRestored) return;
    setDraftRestored(true);

    const draft = readDraft();
    if (!draft) return;

    const conta = contas.find((item) => item.id === draft.contaId);
    if (conta) setContaId(conta.id);

    const restoredItems = draft.items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return product ? { product, quantity: item.quantity } : null;
      })
      .filter((item): item is PurchaseDraftItem => item !== null);

    if (restoredItems.length > 0) {
      setCart(restoredItems);
      setSuccessMessage('Uma compra em andamento foi restaurada.');
    }
  }, [loadingBase, draftRestored, contas, products]);

  // Salva o rascunho a cada mudança de conta/itens (depois que a restauração
  // inicial já rodou, pra não sobrescrever o rascunho salvo com um estado
  // vazio antes de ele ser lido).
  useEffect(() => {
    if (!draftRestored) return;
    writeDraft({
      contaId: typeof contaId === 'number' ? contaId : 0,
      items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
    });
  }, [draftRestored, contaId, cart]);

  const selectedConta = contas.find((conta) => conta.id === contaId) ?? null;

  useEffect(() => {
    if (!selectedConta) {
      setPurchases([]);
      return;
    }

    let cancelled = false;
    setLoadingHistory(true);

    listPurchases(selectedConta.id)
      .then((data) => {
        if (!cancelled) setPurchases(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getFriendlyErrorMessage(err, 'Não foi possível carregar o histórico da conta.'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedConta?.id]);

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const addItem = () => {
    setError('');

    if (!productId) {
      setError('Selecione um produto.');
      return;
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
      setError('Informe uma quantidade válida.');
      return;
    }

    const product = products.find((item) => item.id === productId);
    if (!product) return;

    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [...current, { product, quantity }];
    });

    setProductId('');
    setQuantity(1);
  };

  const changeQuantity = (productIdToChange: number, newQuantity: number) => {
    setCart((current) =>
      current.map((item) =>
        item.product.id === productIdToChange
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item,
      ),
    );
  };

  const removeItem = (productIdToRemove: number) => {
    setCart((current) => current.filter((item) => item.product.id !== productIdToRemove));
  };

  const finalizePurchase = async () => {
    setError('');

    if (!isOnline) {
      setError('Sem conexão com a internet. A compra fica salva neste dispositivo até você conseguir finalizar.');
      return;
    }

    if (!selectedConta) {
      setError('Selecione a conta para finalizar a compra.');
      return;
    }

    if (cart.length === 0) {
      setError('Adicione ao menos um produto à compra.');
      return;
    }

    setFinalizing(true);
    try {
      const newPurchase = await createPurchase(selectedConta.id, cart);
      setPurchases((current) => [newPurchase, ...current]);
      setCart([]);
      writeDraft(null);
      setSuccessMessage('Compra registrada com sucesso.');
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Não foi possível registrar a compra. O carrinho continua salvo — tente novamente.'));
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 4 }, maxWidth: 1500, mx: 'auto' }}>
      <Box mb={3}>
        <Typography variant="body2" color="text.secondary">
          Movimentações / Compras
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.5 }}>
          Compras
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Selecione a conta, o produto e a quantidade para registrar uma compra.
        </Typography>
      </Box>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button onClick={fetchBaseData}>Tentar novamente</Button>}>
          {loadError}
        </Alert>
      )}

      {loadingBase ? (
        <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <>
          <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3, borderColor: '#E6E9EF' }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="body2" fontWeight={700} mb={1}>
                  Conta
                </Typography>
                <Autocomplete
                  value={selectedConta}
                  onChange={(_, value) => setContaId(value ? value.id : '')}
                  options={contas}
                  getOptionLabel={(conta) => `${conta.nome} — ${conta.telefone}`}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Selecione a conta" size="small" />
                  )}
                  noOptionsText="Nenhuma conta encontrada"
                />
              </Box>

              <Divider />

              <Box>
                <Typography variant="body2" fontWeight={700} mb={1}>
                  Adicionar produto
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} alignItems={{ sm: 'flex-start' }}>
                  <FormControl size="small" sx={{ flex: 2, minWidth: { sm: 260 } }}>
                    <InputLabel id="product-label">Produto</InputLabel>
                    <Select
                      labelId="product-label"
                      label="Produto"
                      value={productId}
                      onChange={(event) => setProductId(Number(event.target.value))}
                    >
                      {products.map((product) => (
                        <MenuItem key={product.id} value={product.id}>
                          {product.description} — {money(product.price)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Quantidade"
                    type="number"
                    size="small"
                    value={quantity}
                    onChange={(event) => setQuantity(Number(event.target.value))}
                    inputProps={{ min: 1 }}
                    sx={{ width: { xs: '100%', sm: 140 } }}
                  />

                  <Button
                    variant="contained"
                    startIcon={<AddShoppingCartOutlined />}
                    onClick={addItem}
                    sx={{ height: 40, alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
                  >
                    Adicionar
                  </Button>
                </Stack>
              </Box>

              {error && (
                <Typography variant="body2" color="error.main" fontWeight={600}>
                  {error}
                </Typography>
              )}

              <Box>
                <Typography variant="body2" fontWeight={700} mb={1}>
                  Itens da compra
                </Typography>
                <PurchaseCartTable items={cart} onChangeQuantity={changeQuantity} onRemove={removeItem} />
              </Box>

              <Divider />

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                gap={2}
              >
                <Typography variant="h6">
                  Total:{' '}
                  <Typography component="span" variant="h6" color="success.main" fontWeight={800}>
                    {money(total)}
                  </Typography>
                </Typography>

                <Tooltip title={isOnline ? '' : 'Sem conexão — o carrinho fica salvo até a internet voltar'}>
                  <span style={{ alignSelf: 'stretch' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={isOnline ? <CheckCircleOutline /> : <WifiOffOutlined />}
                      onClick={finalizePurchase}
                      disabled={finalizing || !isOnline}
                      sx={{ width: '100%' }}
                    >
                      {finalizing ? 'Registrando...' : isOnline ? 'Finalizar compra' : 'Sem conexão'}
                    </Button>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
          </Paper>

          <Box mb={2}>
            <Typography fontWeight={700}>Histórico de compras</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedConta
                ? `Compras registradas para ${selectedConta.nome}.`
                : 'Selecione uma conta acima para ver o histórico de compras dela.'}
            </Typography>
          </Box>

          {selectedConta ? (
            loadingHistory ? (
              <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <PurchaseHistoryTable purchases={purchases} />
            )
          ) : (
            <Paper
              variant="outlined"
              sx={{ borderColor: '#E6E9EF', py: 8, textAlign: 'center', color: 'text.secondary' }}
            >
              <Typography fontWeight={700}>Nenhuma conta selecionada</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Escolha uma conta no campo acima para visualizar o histórico de compras.
              </Typography>
            </Paper>
          )}
        </>
      )}

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
    </Box>
  );
}

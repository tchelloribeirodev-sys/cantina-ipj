import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add,
  DeleteOutline,
  EditOutlined,
  SearchOutlined,
} from '@mui/icons-material';
import { ProductDialog } from '../components/ProductDialog';
import { emojiOptions } from '../data/emojis';
import { createProduct, deleteProduct, listProducts, updateProduct } from '../services/productsService';
import type { Product, ProductFormData } from '../types/product';
import { getFriendlyErrorMessage } from '../utils/errorMessage';

const currentYear = new Date().getFullYear();

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await listProducts(currentYear);
      setProducts(data);
    } catch (err) {
      setLoadError(getFriendlyErrorMessage(err, 'Não foi possível carregar os produtos.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');

    return products.filter((product) => {
      if (!normalizedSearch) return true;
      return (
        product.description.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        String(product.id).includes(normalizedSearch)
      );
    });
  }, [products, search]);

  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const money = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  const openNew = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const saveProduct = async (data: ProductFormData) => {
    setSaving(true);
    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, data);
        setProducts((current) =>
          current.map((product) => (product.id === updated.id ? updated : product)),
        );
        setMessage('Produto atualizado com sucesso.');
      } else {
        const created = await createProduct({ ...data, year: currentYear });
        setProducts((current) => [...current, created]);
        setMessage('Produto cadastrado com sucesso.');
      }
      setDialogOpen(false);
    } catch (err) {
      setMessage(getFriendlyErrorMessage(err, 'Não foi possível salvar o produto.'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteProduct(deleteTarget.id);
      setProducts((current) => current.filter((product) => product.id !== deleteTarget.id));
      setMessage('Produto excluído com sucesso.');
    } catch (err) {
      setMessage(getFriendlyErrorMessage(err, 'Não foi possível excluir o produto.'));
    } finally {
      setDeleteTarget(null);
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
            Cadastros / Produtos
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.5 }}>
            Produtos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Cadastre e gerencie os produtos disponíveis em {currentYear}.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openNew}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Novo produto
        </Button>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 1.5, md: 2 },
          mb: 2,
          borderColor: '#E6E9EF',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
          <TextField
            size="small"
            label="Buscar por descrição"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Paper>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button onClick={fetchProducts}>Tentar novamente</Button>}>
          {loadError}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ borderColor: '#E6E9EF', overflow: 'hidden' }}>
        <Box
          sx={{
            px: { xs: 2, md: 2.5 },
            py: 1.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #EEF0F4',
          }}
        >
          <Box>
            <Typography fontWeight={700}>
              Lista de produtos
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Produtos cadastrados em {currentYear}.
            </Typography>
          </Box>
          <Chip
            size="small"
            label={`${filteredProducts.length} ${filteredProducts.length === 1 ? 'produto' : 'produtos'}`}
          />
        </Box>

        {loading ? (
          <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 720 }}>
                <TableHead>
                  <TableRow>
                    <TableCell width={80}>ID</TableCell>
                    <TableCell width={100}>Imagem</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell width={150}>Preço</TableCell>
                    <TableCell width={110} align="right">
                      Ações
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell sx={{ color: 'text.secondary' }}>
                        #{String(product.id).padStart(4, '0')}
                      </TableCell>

                      <TableCell>
                        {product.imageUrl ? (
                          <Box
                            component="img"
                            src={product.imageUrl}
                            alt={product.description}
                            sx={{
                              width: 52,
                              height: 52,
                              objectFit: 'cover',
                              borderRadius: 1.5,
                              display: 'block',
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 52,
                              height: 52,
                              borderRadius: 1.5,
                              bgcolor: '#F1F3F6',
                              display: 'grid',
                              placeItems: 'center',
                              color: 'text.secondary',
                            }}
                          >
                            —
                          </Box>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography fontSize={14} fontWeight={700}>
                          {product.emojiIndex !== null && emojiOptions[product.emojiIndex]
                            ? `${emojiOptions[product.emojiIndex].emoji} `
                            : ''}
                          {product.description}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography fontSize={14} fontWeight={700} color="success.main">
                          {money(product.price)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton size="small" color="primary" onClick={() => openEdit(product)}>
                            <EditOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget(product)}>
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

                  {paginatedProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Box sx={{ py: 8, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Nenhum produto encontrado
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredProducts.length}
              page={page}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(Number(event.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Itens por página"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </>
        )}
      </Paper>

      <ProductDialog
        open={dialogOpen}
        year={currentYear}
        product={editingProduct}
        onClose={() => (saving ? null : setDialogOpen(false))}
        onSave={saveProduct}
      />

      <Snackbar open={Boolean(deleteTarget)} autoHideDuration={null} onClose={() => setDeleteTarget(null)}>
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
          Excluir "{deleteTarget?.description}"?
        </Alert>
      </Snackbar>

      <Snackbar open={Boolean(message)} autoHideDuration={3000} onClose={() => setMessage('')} message={message} />
    </Box>
  );
}

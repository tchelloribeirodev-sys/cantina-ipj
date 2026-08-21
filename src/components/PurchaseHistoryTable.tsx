import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { DeleteOutline, KeyboardArrowDown, KeyboardArrowUp, RemoveShoppingCartOutlined } from '@mui/icons-material';
import { QuantityStepper } from './QuantityStepper';
import type { Purchase } from '../types/purchase';

interface PurchaseHistoryTableProps {
  purchases: Purchase[];
  onChangeItemQuantity?: (purchaseId: number, itemId: number, quantity: number) => void;
  onRemoveItem?: (purchaseId: number, itemId: number) => void;
  onCancelPurchase?: (purchaseId: number) => void;
  busy?: boolean;
}

const money = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

function PurchaseRow({
  purchase,
  onChangeItemQuantity,
  onRemoveItem,
  onCancelPurchase,
  busy,
}: {
  purchase: Purchase;
  onChangeItemQuantity?: (purchaseId: number, itemId: number, quantity: number) => void;
  onRemoveItem?: (purchaseId: number, itemId: number) => void;
  onCancelPurchase?: (purchaseId: number) => void;
  busy?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const editable = Boolean(onChangeItemQuantity || onRemoveItem || onCancelPurchase);

  return (
    <>
      <TableRow hover>
        <TableCell width={48}>
          <IconButton size="small" onClick={() => setOpen((current) => !current)}>
            {open ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ color: 'text.secondary' }}>#{String(purchase.id).padStart(4, '0')}</TableCell>
        <TableCell>
          <Typography fontSize={14} fontWeight={700}>
            {purchase.contaNome}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip size="small" label={`${purchase.items.length} ${purchase.items.length === 1 ? 'item' : 'itens'}`} />
        </TableCell>
        <TableCell sx={{ color: 'text.secondary' }}>{formatDate(purchase.createdAt)}</TableCell>
        <TableCell>
          <Typography fontSize={14} fontWeight={700} color="success.main">
            {money(purchase.total)}
          </Typography>
        </TableCell>
        {editable && (
          <TableCell align="right">
            {onCancelPurchase && (
              <Tooltip title="Cancelar compra inteira">
                <IconButton size="small" color="error" onClick={() => setConfirmingCancel(true)} disabled={busy}>
                  <RemoveShoppingCartOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </TableCell>
        )}
      </TableRow>

      <TableRow>
        <TableCell colSpan={editable ? 7 : 6} sx={{ p: 0, borderBottom: open ? undefined : 'none' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ px: 3, py: 2, bgcolor: '#FAFBFC' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Produto</TableCell>
                    <TableCell width={130}>Preço unit.</TableCell>
                    <TableCell width={editable ? 150 : 110}>Quantidade</TableCell>
                    <TableCell width={130}>Subtotal</TableCell>
                    {editable && <TableCell width={60} align="right" />}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchase.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{money(item.unitPrice)}</TableCell>
                      <TableCell>
                        {onChangeItemQuantity ? (
                          <QuantityStepper
                            value={item.quantity}
                            disabled={busy}
                            onChange={(next) => onChangeItemQuantity(purchase.id, item.id, next)}
                          />
                        ) : (
                          item.quantity
                        )}
                      </TableCell>
                      <TableCell>{money(item.unitPrice * item.quantity)}</TableCell>
                      {editable && (
                        <TableCell align="right">
                          {onRemoveItem && (
                            <Tooltip title="Remover item (produto errado, por exemplo)">
                              <IconButton
                                size="small"
                                color="error"
                                disabled={busy}
                                onClick={() => setItemToRemove(item.id)}
                              >
                                <DeleteOutline fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      {onRemoveItem && (
        <Snackbar open={itemToRemove !== null} autoHideDuration={null} onClose={() => setItemToRemove(null)}>
          <Alert
            severity="warning"
            variant="filled"
            action={
              <Stack direction="row">
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    if (itemToRemove !== null) onRemoveItem(purchase.id, itemToRemove);
                    setItemToRemove(null);
                  }}
                >
                  Remover
                </Button>
                <Button color="inherit" size="small" onClick={() => setItemToRemove(null)}>
                  Cancelar
                </Button>
              </Stack>
            }
          >
            Remover este item da compra?
          </Alert>
        </Snackbar>
      )}

      {onCancelPurchase && (
        <Snackbar open={confirmingCancel} autoHideDuration={null} onClose={() => setConfirmingCancel(false)}>
          <Alert
            severity="error"
            variant="filled"
            action={
              <Stack direction="row">
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    onCancelPurchase(purchase.id);
                    setConfirmingCancel(false);
                  }}
                >
                  Cancelar compra
                </Button>
                <Button color="inherit" size="small" onClick={() => setConfirmingCancel(false)}>
                  Voltar
                </Button>
              </Stack>
            }
          >
            Cancelar esta compra inteira (#{String(purchase.id).padStart(4, '0')})? Essa ação não pode ser desfeita.
          </Alert>
        </Snackbar>
      )}
    </>
  );
}

export function PurchaseHistoryTable({
  purchases,
  onChangeItemQuantity,
  onRemoveItem,
  onCancelPurchase,
  busy,
}: PurchaseHistoryTableProps) {
  const editable = Boolean(onChangeItemQuantity || onRemoveItem || onCancelPurchase);

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderColor: '#E6E9EF' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width={48} />
            <TableCell width={90}>ID</TableCell>
            <TableCell>Conta</TableCell>
            <TableCell width={110}>Itens</TableCell>
            <TableCell width={170}>Data</TableCell>
            <TableCell width={140}>Total</TableCell>
            {editable && <TableCell width={60} align="right" />}
          </TableRow>
        </TableHead>

        <TableBody>
          {purchases.map((purchase) => (
            <PurchaseRow
              key={purchase.id}
              purchase={purchase}
              onChangeItemQuantity={onChangeItemQuantity}
              onRemoveItem={onRemoveItem}
              onCancelPurchase={onCancelPurchase}
              busy={busy}
            />
          ))}

          {purchases.length === 0 && (
            <TableRow>
              <TableCell colSpan={editable ? 7 : 6}>
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography fontWeight={700}>Nenhuma compra registrada</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    As compras finalizadas aparecerão aqui.
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

import { useState } from 'react';
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import type { Purchase } from '../types/purchase';

interface PurchaseHistoryTableProps {
  purchases: Purchase[];
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

function PurchaseRow({ purchase }: { purchase: Purchase }) {
  const [open, setOpen] = useState(false);

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
      </TableRow>

      <TableRow>
        <TableCell colSpan={6} sx={{ p: 0, borderBottom: open ? undefined : 'none' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ px: 3, py: 2, bgcolor: '#FAFBFC' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Produto</TableCell>
                    <TableCell width={130}>Preço unit.</TableCell>
                    <TableCell width={110}>Quantidade</TableCell>
                    <TableCell width={130}>Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchase.items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{money(item.unitPrice)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{money(item.unitPrice * item.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export function PurchaseHistoryTable({ purchases }: PurchaseHistoryTableProps) {
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
          </TableRow>
        </TableHead>

        <TableBody>
          {purchases.map((purchase) => (
            <PurchaseRow key={purchase.id} purchase={purchase} />
          ))}

          {purchases.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>
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

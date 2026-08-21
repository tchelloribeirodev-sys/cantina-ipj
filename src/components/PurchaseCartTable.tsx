import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import { QuantityStepper } from './QuantityStepper';
import type { PurchaseDraftItem } from '../types/purchase';

interface PurchaseCartTableProps {
  items: PurchaseDraftItem[];
  onChangeQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

const money = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function PurchaseCartTable({ items, onChangeQuantity, onRemove }: PurchaseCartTableProps) {
  if (items.length === 0) {
    return (
      <Box
        sx={{
          border: '1px dashed #C7CDD9',
          borderRadius: 2,
          py: 5,
          textAlign: 'center',
          color: 'text.secondary',
        }}
      >
        <Typography fontWeight={700}>Nenhum item adicionado</Typography>
        <Typography variant="body2">
          Selecione um produto e a quantidade acima para adicionar à compra.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderColor: '#E6E9EF' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Produto</TableCell>
            <TableCell width={140}>Preço unit.</TableCell>
            <TableCell width={130}>Quantidade</TableCell>
            <TableCell width={140}>Subtotal</TableCell>
            <TableCell width={70} align="right">
              Ações
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map(({ product, quantity }) => (
            <TableRow key={product.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {product.imageUrl ? (
                    <Box
                      component="img"
                      src={product.imageUrl}
                      alt={product.description}
                      sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: '#F1F3F6',
                        display: 'grid',
                        placeItems: 'center',
                        color: 'text.secondary',
                        fontSize: 12,
                      }}
                    >
                      —
                    </Box>
                  )}
                  <Typography fontSize={14} fontWeight={700}>
                    {product.description}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell>{money(product.price)}</TableCell>

              <TableCell>
                <QuantityStepper
                  value={quantity}
                  onChange={(next) => onChangeQuantity(product.id, next)}
                />
              </TableCell>

              <TableCell>
                <Typography fontSize={14} fontWeight={700} color="success.main">
                  {money(product.price * quantity)}
                </Typography>
              </TableCell>

              <TableCell align="right">
                <Tooltip title="Remover">
                  <IconButton size="small" color="error" onClick={() => onRemove(product.id)}>
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

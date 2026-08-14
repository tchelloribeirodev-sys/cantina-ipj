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
  Typography,
  Tooltip,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import type { Conta } from '../types/account';

interface ContasTableProps {
  contas: Conta[];
  onEdit: (conta: Conta) => void;
  onDelete: (conta: Conta) => void;
}

export function ContasTable({
  contas,
  onEdit,
  onDelete,
}: ContasTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nome</TableCell>
            <TableCell>Telefone</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {contas.map((conta) => (
            <TableRow key={conta.id}>
              <TableCell>{conta.id}</TableCell>

              <TableCell>{conta.nome}</TableCell>

              <TableCell>{conta.telefone}</TableCell>

              <TableCell align="right">
                <Tooltip title="Editar">
                  <IconButton
                    onClick={() => onEdit(conta)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Excluir">
                  <IconButton
                    onClick={() => onDelete(conta)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}

          {contas.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                align="center"
              >
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
  );
}
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  TextField,
} from '@mui/material';
import { Conta, ContaFormData } from '../types/account';

interface ContaFormProps {
  conta?: Conta;
  onSubmit: (data: ContaFormData) => void;
  onCancel: () => void;
}

const formatTelefone = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);

  if (numbers.length <= 2) {
    return numbers;
  }

  if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }

  if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }

  return numbers;
};

export function ContaForm({
  conta,
  onSubmit,
  onCancel,
}: ContaFormProps) {
  const [nome, setNome] = useState(conta?.nome ?? '');
  const [telefone, setTelefone] = useState(conta?.telefone ?? '');

  const [errors, setErrors] = useState({
    nome: '',
    telefone: '',
  });

  useEffect(() => {
    setNome(conta?.nome ?? '');
    setTelefone(conta?.telefone ?? '');
  }, [conta]);

  const validate = (): boolean => {
    const newErrors = {
      nome: '',
      telefone: '',
    };

    if (!nome.trim()) {
      newErrors.nome = 'Informe o nome.';
    }

    const telefoneNumbers = telefone.replace(/\D/g, '');

    if (!telefoneNumbers) {
      newErrors.telefone = 'Informe o telefone.';
    } else if (
      telefoneNumbers.length !== 10 &&
      telefoneNumbers.length !== 11
    ) {
      newErrors.telefone = 'Informe um telefone válido.';
    }

    setErrors(newErrors);

    return !newErrors.nome && !newErrors.telefone;
  };

  const handleSubmit = (): void => {
    if (!validate()) {
      return;
    }

    onSubmit({
      nome: nome.trim(),
      telefone,
    });
  };

  return (
    <>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pt: 1,
          }}
        >
          <TextField
            label="Nome"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            error={Boolean(errors.nome)}
            helperText={errors.nome}
            required
            fullWidth
            autoFocus
          />

          <TextField
            label="Telefone"
            value={telefone}
            onChange={(event) =>
              setTelefone(formatTelefone(event.target.value))
            }
            error={Boolean(errors.telefone)}
            helperText={errors.telefone}
            placeholder="(11) 99999-9999"
            required
            fullWidth
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          Salvar
        </Button>
      </DialogActions>
    </>
  );
}
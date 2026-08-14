import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { CloudUploadOutlined, DeleteOutline, ImageOutlined } from '@mui/icons-material';
import { emojiOptions } from '../data/emojis';
import type { Product, ProductFormData } from '../types/product';
import { formatCurrencyValue, maskCurrencyInput, parseCurrencyInput } from '../utils/currencyInput';

interface ProductDialogProps {
  open: boolean;
  year: number;
  product: Product | null;
  onClose: () => void;
  onSave: (data: ProductFormData) => void;
}

export function ProductDialog({ open, year, product, onClose, onSave }: ProductDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [emojiIndex, setEmojiIndex] = useState<number | null>(null);
  const [error, setError] = useState('');

  const editing = product !== null;

  useEffect(() => {
    if (!open) return;
    setDescription(product?.description ?? '');
    setPrice(product ? formatCurrencyValue(product.price) : '');
    setImageUrl(product?.imageUrl ?? null);
    setEmojiIndex(product?.emojiIndex ?? null);
    setError('');
  }, [open, product]);

  const handleImage = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImageUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    const numericPrice = parseCurrencyInput(price);

    if (!description.trim()) {
      setError('Informe a descrição do produto.');
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setError('Informe um preço válido.');
      return;
    }

    onSave({
      description: description.trim(),
      price: numericPrice,
      imageUrl,
      year,
      emojiIndex,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6">{editing ? 'Editar produto' : 'Novo produto'}</Typography>
        <Typography variant="body2" color="text.secondary">
          {editing ? 'Altere os dados do produto.' : `O produto será cadastrado no ano corrente (${year}).`}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.2} sx={{ pt: 0.5 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="ID"
            value={editing ? product.id : 'Automático'}
            disabled
            InputProps={{
              startAdornment: editing ? <InputAdornment position="start">#</InputAdornment> : undefined,
            }}
            fullWidth
          />

          <TextField
            label="Descrição"
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex.: Arroz Branco 5kg"
            fullWidth
            autoFocus
          />

          <TextField
            label="Preço"
            required
            value={price}
            onChange={(event) => setPrice(maskCurrencyInput(event.target.value))}
            placeholder="0,00"
            InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            }}
            inputMode="decimal"
            fullWidth
          />

          <Box>
            <Typography variant="body2" fontWeight={700} mb={0.75}>
              Emoji
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Usado na mensagem de cobrança enviada por WhatsApp.
            </Typography>

            <Stack direction="row" flexWrap="wrap" gap={1}>
              <Box
                component="button"
                type="button"
                onClick={() => setEmojiIndex(null)}
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: emojiIndex === null ? 'primary.main' : '#E1E5EC',
                  bgcolor: emojiIndex === null ? '#EEF1FC' : 'white',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: 'text.secondary',
                }}
              >
                Nenhum
              </Box>

              {emojiOptions.map((option, index) => (
                <Tooltip key={option.label} title={option.label}>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => setEmojiIndex(index)}
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: emojiIndex === index ? 'primary.main' : '#E1E5EC',
                      bgcolor: emojiIndex === index ? '#EEF1FC' : 'white',
                      cursor: 'pointer',
                      fontSize: 20,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {option.emoji}
                  </Box>
                </Tooltip>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={700} mb={0.75}>
              Imagem
            </Typography>

            {imageUrl ? (
              <Box
                sx={{
                  position: 'relative',
                  border: '1px solid #E1E5EC',
                  borderRadius: 2,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box
                  component="img"
                  src={imageUrl}
                  alt={description || 'Produto'}
                  sx={{ width: 72, height: 72, borderRadius: 1.5, objectFit: 'cover' }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={700}>
                    Imagem selecionada
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    PNG, JPG ou WEBP até 2 MB
                  </Typography>
                </Box>
                <IconButton color="error" onClick={() => setImageUrl(null)} aria-label="Remover imagem">
                  <DeleteOutline />
                </IconButton>
              </Box>
            ) : (
              <Box
                component="button"
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  handleImage(event.dataTransfer.files[0]);
                }}
                sx={{
                  width: '100%',
                  border: '1px dashed #B8C0CC',
                  borderRadius: 2,
                  bgcolor: '#FAFBFC',
                  p: 3,
                  cursor: 'pointer',
                  color: 'text.secondary',
                }}
              >
                <CloudUploadOutlined sx={{ fontSize: 36, mb: 0.5 }} />
                <Typography variant="body2" fontWeight={700}>
                  Clique para selecionar ou arraste a imagem
                </Typography>
                <Typography variant="caption">
                  PNG, JPG ou WEBP até 2 MB
                </Typography>
              </Box>
            )}

            <input
              ref={inputRef}
              hidden
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => handleImage(event.target.files?.[0])}
            />

            {!imageUrl && (
              <Button
                size="small"
                startIcon={<ImageOutlined />}
                sx={{ mt: 1 }}
                onClick={() => inputRef.current?.click()}
              >
                Selecionar imagem
              </Button>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editing ? 'Salvar alterações' : 'Salvar produto'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
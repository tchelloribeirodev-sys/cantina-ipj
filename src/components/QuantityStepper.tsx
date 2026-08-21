import { IconButton, Stack, TextField } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

// Stepper de quantidade com botões grandes (+/-), pensado para uso rápido em
// tablet/celular durante o atendimento — mais fácil de tocar do que digitar
// número em um campo pequeno.
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  disabled,
  size = 'small',
}: QuantityStepperProps) {
  const buttonSize = size === 'small' ? 30 : 38;

  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1);

  const handleTyped = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return;
    const next = Number(digits);
    onChange(max !== undefined ? Math.min(max, Math.max(min, next)) : Math.max(min, next));
  };

  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <IconButton
        onClick={decrease}
        disabled={disabled || value <= min}
        sx={{
          width: buttonSize,
          height: buttonSize,
          border: '1px solid #E1E5EC',
          borderRadius: 1.5,
        }}
      >
        <Remove fontSize="inherit" sx={{ fontSize: size === 'small' ? 16 : 20 }} />
      </IconButton>

      <TextField
        value={value}
        onChange={(event) => handleTyped(event.target.value)}
        disabled={disabled}
        size="small"
        inputProps={{
          inputMode: 'numeric',
          style: { textAlign: 'center', padding: '6px 0', width: 30 },
        }}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
      />

      <IconButton
        onClick={increase}
        disabled={disabled || (max !== undefined && value >= max)}
        sx={{
          width: buttonSize,
          height: buttonSize,
          border: '1px solid #E1E5EC',
          borderRadius: 1.5,
        }}
      >
        <Add fontSize="inherit" sx={{ fontSize: size === 'small' ? 16 : 20 }} />
      </IconButton>
    </Stack>
  );
}

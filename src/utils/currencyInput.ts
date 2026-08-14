// Máscara de valor monetário: os dígitos digitados são tratados como centavos,
// preenchendo da direita para a esquerda (ex.: "1234" -> "12,34").
export function maskCurrencyInput(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '');
  if (!digits) return '';

  const cents = parseInt(digits, 10);
  return formatCurrencyValue(cents / 100);
}

export function parseCurrencyInput(value: string): number {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 0;

  return parseInt(digits, 10) / 100;
}

export function formatCurrencyValue(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

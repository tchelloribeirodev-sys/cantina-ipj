import type { Fechamento } from '../types/settlement';

// MOCK: valor pago e observação lançados manualmente por conta. Ao integrar
// com Supabase, isso deve vir da tabela "fechamentos" (uma linha por conta),
// enquanto o valor total continua sendo calculado a partir das compras.
export const initialFechamentos: Fechamento[] = [
  {
    id: 1,
    contaId: 1,
    valorPago: 90.74,
    observacao: 'Pago via PIX em 05/08.',
    atualizadoEm: new Date().toISOString(),
  },
];

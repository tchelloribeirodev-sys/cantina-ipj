import type { Purchase } from '../types/purchase';

// MOCK: histórico inicial de compras. Ao integrar com Supabase, este array
// deve ser substituído pela consulta na tabela "compras" (join com "itens_compra").
export const initialPurchases: Purchase[] = [
  {
    id: 1,
    contaId: 1,
    contaNome: 'João da Silva',
    items: [
      {
        productId: 1,
        description: 'Arroz Branco 5kg',
        imageUrl:
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=160&q=80',
        unitPrice: 28.9,
        quantity: 2,
        emojiIndex: 1,
      },
      {
        productId: 4,
        description: 'Leite Integral 1L',
        imageUrl:
          'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=160&q=80',
        unitPrice: 5.49,
        quantity: 6,
        emojiIndex: 0,
      },
    ],
    total: 90.74,
    createdAt: new Date().toISOString(),
  },
];

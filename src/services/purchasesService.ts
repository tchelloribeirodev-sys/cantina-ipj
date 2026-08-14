import { supabase } from '../lib/supabaseClient';
import type { Purchase, PurchaseDraftItem } from '../types/purchase';

interface CompraRow {
  id: number;
  conta_id: number;
  total: number;
  created_at: string;
  contas: { nome: string } | { nome: string }[] | null;
  itens_compra: {
    produto_id: number;
    descricao: string;
    imagem_url: string | null;
    preco_unitario: number;
    quantidade: number;
    emoji_indice: number | null;
  }[];
}

const SELECT_COLUMNS =
  'id, conta_id, total, created_at, contas(nome), itens_compra(produto_id, descricao, imagem_url, preco_unitario, quantidade, emoji_indice)';

const contaNomeFromRow = (contas: CompraRow['contas']): string => {
  if (!contas) return '';
  return Array.isArray(contas) ? contas[0]?.nome ?? '' : contas.nome;
};

const fromRow = (row: CompraRow): Purchase => ({
  id: row.id,
  contaId: row.conta_id,
  contaNome: contaNomeFromRow(row.contas),
  total: Number(row.total),
  createdAt: row.created_at,
  items: (row.itens_compra ?? []).map((item) => ({
    productId: item.produto_id,
    description: item.descricao,
    imageUrl: item.imagem_url,
    unitPrice: Number(item.preco_unitario),
    quantity: item.quantidade,
    emojiIndex: item.emoji_indice,
  })),
});

export async function listPurchases(contaId?: number): Promise<Purchase[]> {
  let query = supabase.from('compras').select(SELECT_COLUMNS).order('created_at', { ascending: false });

  if (contaId) {
    query = query.eq('conta_id', contaId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as unknown as CompraRow[]).map(fromRow);
}

// Consulta leve (sem os itens) usada no Dashboard, em Fechamentos e em
// Relatórios, que só precisam do total por conta.
export async function getTotalsByConta(): Promise<Map<number, number>> {
  const { data, error } = await supabase.from('compras').select('conta_id, total');
  if (error) throw error;

  const totals = new Map<number, number>();
  (data ?? []).forEach((row: { conta_id: number; total: number }) => {
    totals.set(row.conta_id, (totals.get(row.conta_id) ?? 0) + Number(row.total));
  });

  return totals;
}

// Total de compras registradas (para cards de indicador no Dashboard).
export async function countPurchases(): Promise<number> {
  const { count, error } = await supabase.from('compras').select('id', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

// Últimas compras (com itens), usada no Dashboard.
export async function listRecentPurchases(limit: number): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from('compras')
    .select(SELECT_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return ((data ?? []) as unknown as CompraRow[]).map(fromRow);
}

export interface ConsumoItem {
  descricao: string;
  emojiIndex: number | null;
  quantidade: number;
  subtotal: number;
}

// Consumo agregado por produto de uma conta (somando todas as compras dela).
// Usado para montar a mensagem de WhatsApp do fechamento, item a item.
export async function getConsumoByConta(contaId: number): Promise<ConsumoItem[]> {
  const { data, error } = await supabase
    .from('itens_compra')
    .select('produto_id, descricao, preco_unitario, quantidade, emoji_indice, compras!inner(conta_id)')
    .eq('compras.conta_id', contaId);

  if (error) throw error;

  const agrupado = new Map<string, ConsumoItem>();

  (data ?? []).forEach(
    (row: {
      produto_id: number | null;
      descricao: string;
      preco_unitario: number;
      quantidade: number;
      emoji_indice: number | null;
    }) => {
      const chave = row.produto_id != null ? `p-${row.produto_id}` : `d-${row.descricao}`;
      const subtotal = Number(row.preco_unitario) * row.quantidade;
      const existente = agrupado.get(chave);

      if (existente) {
        existente.quantidade += row.quantidade;
        existente.subtotal += subtotal;
      } else {
        agrupado.set(chave, {
          descricao: row.descricao,
          emojiIndex: row.emoji_indice,
          quantidade: row.quantidade,
          subtotal,
        });
      }
    },
  );

  return Array.from(agrupado.values()).sort((a, b) => b.subtotal - a.subtotal);
}

// ATENÇÃO: a inserção em "compras" e depois em "itens_compra" acontece em duas
// chamadas separadas (o supabase-js não expõe transações no cliente). Para um
// uso mais crítico, o ideal é mover essa lógica para uma função (RPC) no
// Postgres que faça as duas inserções em uma única transação.
export async function createPurchase(contaId: number, items: PurchaseDraftItem[]): Promise<Purchase> {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const { data: compra, error: compraError } = await supabase
    .from('compras')
    .insert({ conta_id: contaId, total })
    .select('id, conta_id, total, created_at, contas(nome)')
    .single();

  if (compraError) throw compraError;

  const itensPayload = items.map((item) => ({
    compra_id: compra.id,
    produto_id: item.product.id,
    descricao: item.product.description,
    imagem_url: item.product.imageUrl,
    preco_unitario: item.product.price,
    quantidade: item.quantity,
    emoji_indice: item.product.emojiIndex,
  }));

  const { error: itensError } = await supabase.from('itens_compra').insert(itensPayload);
  if (itensError) throw itensError;

  return {
    id: compra.id,
    contaId: compra.conta_id,
    contaNome: contaNomeFromRow(compra.contas as CompraRow['contas']),
    total: Number(compra.total),
    createdAt: compra.created_at,
    items: items.map((item) => ({
      productId: item.product.id,
      description: item.product.description,
      imageUrl: item.product.imageUrl,
      unitPrice: item.product.price,
      quantity: item.quantity,
      emojiIndex: item.product.emojiIndex,
    })),
  };
}

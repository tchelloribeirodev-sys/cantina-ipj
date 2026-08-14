import { supabase } from '../lib/supabaseClient';
import type { Product, ProductFormData } from '../types/product';

interface ProductRow {
  id: number;
  descricao: string;
  preco: number;
  imagem_url: string | null;
  ano: number;
  emoji_indice: number | null;
}

const SELECT_COLUMNS = 'id, descricao, preco, imagem_url, ano, emoji_indice';

const fromRow = (row: ProductRow): Product => ({
  id: row.id,
  description: row.descricao,
  price: Number(row.preco),
  imageUrl: row.imagem_url,
  year: row.ano,
  emojiIndex: row.emoji_indice,
});

export async function listProducts(year: number): Promise<Product[]> {
  const { data, error } = await supabase
    .from('produtos')
    .select(SELECT_COLUMNS)
    .eq('ano', year)
    .order('descricao', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function createProduct(data: ProductFormData): Promise<Product> {
  const { data: row, error } = await supabase
    .from('produtos')
    .insert({
      descricao: data.description,
      preco: data.price,
      imagem_url: data.imageUrl,
      ano: data.year,
      emoji_indice: data.emojiIndex,
    })
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw error;
  return fromRow(row);
}

export async function updateProduct(id: number, data: ProductFormData): Promise<Product> {
  const { data: row, error } = await supabase
    .from('produtos')
    .update({
      descricao: data.description,
      preco: data.price,
      imagem_url: data.imageUrl,
      emoji_indice: data.emojiIndex,
    })
    .eq('id', id)
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw error;
  return fromRow(row);
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase.from('produtos').delete().eq('id', id);
  if (error) throw error;
}

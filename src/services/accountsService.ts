import { supabase } from '../lib/supabaseClient';
import type { Conta, ContaFormData } from '../types/account';

interface ContaRow {
  id: number;
  nome: string;
  telefone: string;
  ano: number;
}

const fromRow = (row: ContaRow): Conta => ({
  id: row.id,
  nome: row.nome,
  telefone: row.telefone,
  ano: row.ano,
});

export async function listContas(year: number): Promise<Conta[]> {
  const { data, error } = await supabase
    .from('contas')
    .select('id, nome, telefone, ano')
    .eq('ano', year)
    .order('nome', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function createConta(data: ContaFormData, year: number): Promise<Conta> {
  const { data: row, error } = await supabase
    .from('contas')
    .insert({ nome: data.nome, telefone: data.telefone, ano: year })
    .select('id, nome, telefone, ano')
    .single();

  if (error) throw error;
  return fromRow(row);
}

export async function updateConta(id: number, data: ContaFormData): Promise<Conta> {
  const { data: row, error } = await supabase
    .from('contas')
    .update({ nome: data.nome, telefone: data.telefone })
    .eq('id', id)
    .select('id, nome, telefone, ano')
    .single();

  if (error) throw error;
  return fromRow(row);
}

export async function deleteConta(id: number): Promise<void> {
  const { error } = await supabase.from('contas').delete().eq('id', id);
  if (error) throw error;
}

// Usado na tela de Relatórios para listar os anos com contas cadastradas.
export async function listDistinctYears(): Promise<number[]> {
  const { data, error } = await supabase.from('contas').select('ano');
  if (error) throw error;

  const years = new Set((data ?? []).map((row: { ano: number }) => row.ano));
  return Array.from(years).sort((a, b) => b - a);
}

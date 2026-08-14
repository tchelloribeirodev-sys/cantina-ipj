import { supabase } from '../lib/supabaseClient';
import type { Fechamento, FechamentoFormData } from '../types/settlement';

interface FechamentoRow {
  id: number;
  conta_id: number;
  valor_pago: number;
  observacao: string | null;
  atualizado_em: string;
}

const fromRow = (row: FechamentoRow): Fechamento => ({
  id: row.id,
  contaId: row.conta_id,
  valorPago: Number(row.valor_pago),
  observacao: row.observacao ?? '',
  atualizadoEm: row.atualizado_em,
});

export async function listFechamentos(): Promise<Fechamento[]> {
  const { data, error } = await supabase
    .from('fechamentos')
    .select('id, conta_id, valor_pago, observacao, atualizado_em');

  if (error) throw error;
  return (data ?? []).map(fromRow);
}

// Requer uma constraint UNIQUE em fechamentos.conta_id (já incluída no
// supabase-schema.sql) para o "onConflict" funcionar como upsert.
export async function saveFechamento(data: FechamentoFormData): Promise<Fechamento> {
  const { data: row, error } = await supabase
    .from('fechamentos')
    .upsert(
      {
        conta_id: data.contaId,
        valor_pago: data.valorPago,
        observacao: data.observacao,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: 'conta_id' },
    )
    .select('id, conta_id, valor_pago, observacao, atualizado_em')
    .single();

  if (error) throw error;
  return fromRow(row);
}

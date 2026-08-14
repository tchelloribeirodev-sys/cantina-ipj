export interface Fechamento {
  id: number;
  contaId: number;
  valorPago: number;
  observacao: string;
  atualizadoEm: string;
}

export interface FechamentoFormData {
  contaId: number;
  valorPago: number;
  observacao: string;
}

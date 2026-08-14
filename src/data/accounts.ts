import type { Conta } from '../types/account';

const CURRENT_YEAR = new Date().getFullYear();

export const initialContas: Conta[] = [
  {
    id: 1,
    nome: 'João da Silva',
    telefone: '(11) 99999-9999',
    ano: CURRENT_YEAR,
  },
  {
    id: 2,
    nome: 'Maria Oliveira',
    telefone: '(11) 98888-8888',
    ano: CURRENT_YEAR,
  },
  {
    id: 3,
    nome: 'Carlos Santos',
    telefone: '(11) 97777-7777',
    ano: CURRENT_YEAR,
  },
];
import { appConfig } from '../config';
import { emojiOptions } from '../data/emojis';
import type { ConsumoItem } from '../services/purchasesService';

// Mesmo valor formatado, sem o prefixo "R$" — usado nas linhas de item da
// mensagem (ex.: "R$: 36,00").
const moneyPlain = (value: number) =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Monta a mensagem de cobrança (usada tanto no envio individual, no modal de
// Fechamento, quanto na cobrança em lote).
export function buildCobrancaMessage(
  nomeConta: string,
  consumo: ConsumoItem[],
  saldo: number,
  observacao?: string,
): string {
  const linhasItens = consumo.map((item) => {
    const emoji =
      item.emojiIndex !== null && emojiOptions[item.emojiIndex] ? emojiOptions[item.emojiIndex].emoji : '🛒';
    return `${emoji}  ${item.descricao} - Qtd : ${item.quantidade} - R$: ${moneyPlain(item.subtotal)}`;
  });

  return [
    `Olá ${nomeConta}, tudo bem? 🙂`,
    'Segue seu consumo na cantina:',
    ...linhasItens,
    `Segue o valor da cantina: 💵 R$ ${moneyPlain(Math.max(saldo, 0))}`,
    `Para pagamento, utilize o pix: ${appConfig.pixKey}`,
    observacao?.trim() ? `Obs.: ${observacao.trim()}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildWhatsappLink(telefone: string, message: string): string {
  const numbers = telefone.replace(/\D/g, '');
  const withCountryCode = numbers.length >= 10 ? `55${numbers}` : numbers;
  return `https://api.whatsapp.com/send/?phone=${withCountryCode}&text=${encodeURIComponent(message)}`;
}

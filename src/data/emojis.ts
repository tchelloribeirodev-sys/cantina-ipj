export interface EmojiOption {
  label: string;
  emoji: string;
}

// O índice de cada item é o valor salvo em produtos.emoji_indice.
// Não reordene nem remova itens do meio da lista — isso mudaria o
// emoji de produtos já cadastrados. Para adicionar novas opções,
// inclua sempre no FINAL da lista.
export const emojiOptions: EmojiOption[] = [
  { label: 'Chocolate', emoji: '🍫' },
  { label: 'Refri', emoji: '🥤' },
  { label: 'Salgadinho', emoji: '🥓' },
  { label: 'Hambúrguer', emoji: '🍔' },
  { label: 'Batata Frita', emoji: '🍟' },
  { label: 'Sanduíche', emoji: '🥪' },
  { label: 'Hot-dog', emoji: '🌭' },
  { label: 'Pizza', emoji: '🍕' },
  { label: 'Pipoca', emoji: '🍿' },
  { label: 'Sorvete', emoji: '🍦' },
];

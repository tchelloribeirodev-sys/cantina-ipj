import type { Product } from './product';

export interface PurchaseItem {
  id: number;
  productId: number;
  description: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  emojiIndex: number | null;
}

export interface Purchase {
  id: number;
  contaId: number;
  contaNome: string;
  items: PurchaseItem[];
  total: number;
  createdAt: string;
}

export interface PurchaseDraftItem {
  product: Product;
  quantity: number;
}

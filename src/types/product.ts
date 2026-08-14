export interface Product {
  id: number;
  description: string;
  price: number;
  imageUrl: string | null;
  year: number;
  emojiIndex: number | null;
}

export interface ProductFormData {
  description: string;
  price: number;
  imageUrl: string | null;
  year: number;
  emojiIndex: number | null;
}
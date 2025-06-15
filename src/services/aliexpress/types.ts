
export interface AliExpressProduct {
  itemId: string;
  title: string;
  price: number;
  rating: number;
  orders: number;
  features: string[];
  imageUrl: string;
  variants?: Array<{
    color?: string;
    size?: string;
    price?: number;
    title: string;
  }>;
  category: string;
  originalData?: any;
}

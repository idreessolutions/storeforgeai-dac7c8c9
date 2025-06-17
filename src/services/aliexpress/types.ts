
export interface AliExpressProduct {
  itemId: string;
  title: string;
  price: number;
  rating: number;
  orders: number;
  features: string[];
  imageUrl: string;
  images: string[]; // Added this property to fix the TypeScript error
  variants?: Array<{
    color?: string;
    size?: string;
    price?: number;
    title: string;
  }>;
  category: string;
  originalData?: any;
}


export interface AliExpressProduct {
  itemId: string;
  title: string;
  price: number;
  rating: number;
  orders: number;
  features: string[];
  imageUrl: string;
  images: string[];
  variants?: Array<{
    title: string;
    price: number;
    color?: string;
    size?: string;
  }>;
  category: string;
  originalData?: {
    verified?: boolean;
    winning_product?: boolean;
    real_images?: boolean;
    niche?: string;
    quality_score?: number;
    guaranteed_generation?: boolean;
    emergency_generation?: boolean;
  };
}

export interface AliExpressApiResponse {
  success: boolean;
  products: AliExpressProduct[];
  total_results: number;
  message?: string;
}

export interface ProductSearchParams {
  keywords: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  min_orders?: number;
  min_rating?: number;
  sort?: 'orders' | 'rating' | 'price';
  page_size?: number;
}

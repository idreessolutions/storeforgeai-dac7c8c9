
export interface AliExpressProduct {
  itemId: string;
  title: string;
  price: number;
  rating: number;
  orders: number;
  features: string[];
  imageUrl: string;
  images: string[];
  variants: Array<{
    title: string;
    price: number;
    color?: string;
    size?: string;
  }>;
  category: string;
  originalData?: any;
}

export interface ProductValidationResult {
  isValid: boolean;
  score: number;
  reasons: string[];
}

export interface EnhancedProductData extends AliExpressProduct {
  enhancedTitle: string;
  enhancedDescription: string;
  enhancedFeatures: string[];
  qualityScore: number;
  imageQuality: number;
}

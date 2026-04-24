export interface ShoppingItem {
  id: string;
  name: string;
  quantity?: string;
}

export interface PlatformItemAssignment {
  itemId: string;
  itemName: string;
  platformName: string;
  price: number;
}

export interface PlatformOption {
  platformId: string;
  platformName: string;
  items: PlatformItemAssignment[]; // Items assigned to this platform in this strategy
  itemPrice: number;
  deliveryFee: number;
  taxes: number;
  discounts: number;
  totalCost: number;
  deliveryTime: string;
  availability: 'in-stock' | 'out-of-stock';
  justification: string;
}

export interface ComparisonResult {
  items: ShoppingItem[];
  strategyType: 'single-platform' | 'split-order';
  bestOption: PlatformOption | PlatformOption[]; // Best option can now be a split strategy (multiple orders)
  alternatives: PlatformOption[]; // Alternatives stay as single platform options usually
  smartInsights: string[];
}

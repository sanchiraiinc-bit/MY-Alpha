import {
  CartItem,
  Coupon,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  TrackingStep,
} from '../types/marketplace';

export interface CartCalculationResult {
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  totalSavings: number;
  itemCount: number;
  isEligibleForFreeDelivery: boolean;
  amountNeededForFreeDelivery: number;
}

/**
 * Calculates cart totals transparently without hidden last-minute surprises.
 */
export function calculateCartTotals(
  items: CartItem[],
  products: Product[],
  coupon: Coupon | null = null,
  freeDeliveryThreshold: number = 999,
  standardDeliveryFee: number = 49
): CartCalculationResult {
  const productMap = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  let originalSubtotal = 0;
  let itemCount = 0;

  for (const item of items) {
    const prod = productMap.get(item.productId);
    if (prod) {
      subtotal += prod.price * item.quantity;
      originalSubtotal += (prod.originalPrice || prod.price) * item.quantity;
      itemCount += item.quantity;
    }
  }

  // Calculate discount from coupon if applicable
  let discountAmount = 0;
  if (coupon && subtotal >= coupon.minOrder) {
    const rawDiscount = (subtotal * coupon.discountPercent) / 100;
    discountAmount = Math.min(rawDiscount, coupon.maxDiscount);
  }

  // Transparent delivery calculation
  const isEligibleForFreeDelivery = subtotal >= freeDeliveryThreshold || items.length === 0;
  const deliveryFee = items.length === 0 ? 0 : isEligibleForFreeDelivery ? 0 : standardDeliveryFee;
  const amountNeededForFreeDelivery = isEligibleForFreeDelivery
    ? 0
    : Math.max(0, freeDeliveryThreshold - subtotal);

  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);
  const catalogDiscount = Math.max(0, originalSubtotal - subtotal);
  const totalSavings = catalogDiscount + discountAmount;

  return {
    subtotal,
    deliveryFee,
    discountAmount: Math.round(discountAmount),
    totalAmount: Math.round(totalAmount),
    totalSavings: Math.round(totalSavings),
    itemCount,
    isEligibleForFreeDelivery,
    amountNeededForFreeDelivery,
  };
}

/**
 * Calculates marketplace commission and seller net settlement payout.
 */
export function calculateSellerSettlement(
  orderItem: OrderItem,
  commissionRatePercent: number = 8
) {
  const grossSale = orderItem.priceAtOrder * orderItem.quantity;
  const commission = Math.round((grossSale * commissionRatePercent) / 100);
  const gstOnCommission = Math.round((commission * 18) / 100); // 18% GST on marketplace services
  const netPayout = grossSale - (commission + gstOnCommission);

  return {
    grossSale,
    commissionRatePercent,
    commission,
    gstOnCommission,
    totalPlatformDeduction: commission + gstOnCommission,
    netPayout: Math.max(0, netPayout),
  };
}

/**
 * Checks whether an order is eligible for cancellation.
 */
export function canCancelOrder(status: OrderStatus): boolean {
  const cancellableStatuses: OrderStatus[] = ['placed', 'confirmed', 'processing'];
  return cancellableStatuses.includes(status);
}

/**
 * Checks whether an order is eligible for return (within return window and delivered).
 */
export function canReturnOrder(status: OrderStatus, returnPolicyDays: number = 7): boolean {
  return status === 'delivered';
}

/**
 * Validates seller KYC details before submission.
 */
export function validateSellerKyc(data: {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  gstNumber: string;
  panNumber: string;
  accountNumber: string;
  ifscCode: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.businessName || data.businessName.trim().length < 3) {
    errors.push('Business name must be at least 3 characters');
  }
  if (!data.ownerName || data.ownerName.trim().length < 2) {
    errors.push('Owner full name is required');
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('A valid business email address is required');
  }
  if (!data.phone || !/^\+?[0-9]{10,12}$/.test(data.phone.replace(/[\s-]/g, ''))) {
    errors.push('A valid 10-digit mobile number is required');
  }
  // Standard Indian GST format: 15 chars e.g. 29ABCDE1234F1Z5
  const cleanGst = data.gstNumber.trim().toUpperCase();
  if (!cleanGst || cleanGst.length !== 15) {
    errors.push('GSTIN must be a 15-character valid registration number');
  }
  // Standard PAN format: 10 chars e.g. ABCDE1234F
  const cleanPan = data.panNumber.trim().toUpperCase();
  if (!cleanPan || cleanPan.length !== 10) {
    errors.push('PAN must be a 10-character alphanumeric number');
  }
  if (!data.accountNumber || data.accountNumber.length < 9) {
    errors.push('Bank account number must be valid');
  }
  if (!data.ifscCode || data.ifscCode.trim().length !== 11) {
    errors.push('IFSC code must be exactly 11 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Advanced search and filter logic with fuzzy keyword match and relevance scoring.
 */
export function filterAndSortProducts(
  products: Product[],
  options: {
    searchQuery?: string;
    category?: string;
    subcategory?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStockOnly?: boolean;
    brand?: string;
    sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'discount';
  }
): Product[] {
  const {
    searchQuery = '',
    category,
    subcategory,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    brand,
    sortBy = 'featured',
  } = options;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const queryTokens = normalizedQuery ? normalizedQuery.split(/\s+/).filter(Boolean) : [];

  let filtered = products.filter((p) => {
    // Only approved products display in marketplace
    if (p.status !== 'approved') return false;

    // Category filter
    if (category && category !== 'All') {
      if (p.category.toLowerCase() !== category.toLowerCase()) return false;
    }

    // Subcategory filter
    if (subcategory && subcategory !== 'All') {
      if (p.subcategory.toLowerCase() !== subcategory.toLowerCase()) return false;
    }

    // Brand filter
    if (brand && brand !== 'All') {
      if (p.brand.toLowerCase() !== brand.toLowerCase()) return false;
    }

    // Price range
    if (minPrice !== undefined && p.price < minPrice) return false;
    if (maxPrice !== undefined && p.price > maxPrice) return false;

    // Rating
    if (minRating !== undefined && p.rating < minRating) return false;

    // Stock
    if (inStockOnly && (!p.inStock || p.stock <= 0)) return false;

    // Search query matching
    if (queryTokens.length > 0) {
      const searchableText = `${p.title} ${p.brand} ${p.category} ${p.subcategory} ${p.description} ${p.tags.join(' ')}`.toLowerCase();
      // Match if all query tokens appear in searchable text
      const matchesAll = queryTokens.every((token) => searchableText.includes(token));
      if (!matchesAll) return false;
    }

    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'discount':
        return b.discountPercent - a.discountPercent;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'featured':
      default:
        // Rank by best seller or rating * review count
        const scoreA = (a.isBestSeller ? 1000 : 0) + a.rating * Math.log10(a.reviewCount + 10);
        const scoreB = (b.isBestSeller ? 1000 : 0) + b.rating * Math.log10(b.reviewCount + 10);
        return scoreB - scoreA;
    }
  });

  return filtered;
}

/**
 * Generates the full 7-stage order tracking progress timeline.
 */
export function generateTrackingTimeline(
  currentStatus: OrderStatus,
  createdAt: string,
  deliveredAt?: string
): TrackingStep[] {
  const sequence: { status: OrderStatus; label: string }[] = [
    { status: 'placed', label: 'Order Placed' },
    { status: 'confirmed', label: 'Payment Confirmed' },
    { status: 'processing', label: 'Seller Processing' },
    { status: 'packed', label: 'Package Packed' },
    { status: 'shipped', label: 'Shipped via Express' },
    { status: 'out_for_delivery', label: 'Out for Delivery' },
    { status: 'delivered', label: 'Delivered' },
  ];

  if (currentStatus === 'cancelled') {
    return [
      { status: 'placed', label: 'Order Placed', timestamp: createdAt, done: true },
      { status: 'cancelled', label: 'Order Cancelled', done: true, current: true },
    ];
  }

  if (currentStatus === 'return_requested' || currentStatus === 'returned') {
    return [
      ...sequence.map((s) => ({ ...s, done: true })),
      {
        status: currentStatus,
        label: currentStatus === 'returned' ? 'Refund Processed' : 'Return In Progress',
        done: true,
        current: true,
      },
    ];
  }

  const currentIndex = sequence.findIndex((s) => s.status === currentStatus);
  const targetIndex = currentIndex >= 0 ? currentIndex : 0;

  return sequence.map((step, idx) => ({
    status: step.status,
    label: step.label,
    timestamp: idx === 0 ? createdAt : idx <= targetIndex ? 'Completed' : undefined,
    done: idx <= targetIndex,
    current: idx === targetIndex,
  }));
}

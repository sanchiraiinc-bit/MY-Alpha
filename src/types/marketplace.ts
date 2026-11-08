export type UserRole = 'customer' | 'seller' | 'admin';

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  type: 'Home' | 'Work';
  isDefault?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  defaultAddressId: string;
  wishlist: string[];
  savedForLater: string[];
}

export interface ProductVariant {
  colors?: string[];
  sizes?: string[];
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  deliveryDays: number;
  deliveryFee: number;
  stock: number;
  inStock: boolean;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  images: string[];
  videoUrl?: string;
  description: string;
  specifications: Record<string, string>;
  variants?: ProductVariant;
  tags: string[];
  verifiedPurchaseOnly?: boolean;
  returnPolicy: string;
  warranty: string;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isDealOfTheDay?: boolean;
  status: 'approved' | 'pending' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

export interface SellerPerformance {
  completionRate: number; // percentage, e.g. 98.4
  cancellationRate: number; // percentage, e.g. 1.2
  returnRate: number; // percentage, e.g. 2.1
  rating: number; // 4.8
  dispatchSpeed: string; // e.g., '< 24 Hours'
}

export interface Seller {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  gstNumber: string;
  panNumber: string;
  bankAccount: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  kycStatus: 'pending' | 'approved' | 'rejected';
  kycSubmittedAt?: string;
  performance: SellerPerformance;
  totalSales: number;
  totalOrders: number;
  pendingPayout: number;
  joinedDate: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned';

export interface TrackingStep {
  status: OrderStatus;
  label: string;
  timestamp?: string;
  done: boolean;
  current?: boolean;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  brand: string;
  priceAtOrder: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  sellerId: string;
  sellerName: string;
  status: OrderStatus;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'COD';
  paymentStatus: 'completed' | 'pending' | 'refunded';
  orderStatus: OrderStatus;
  trackingNumber: string;
  courierName: string;
  estimatedDelivery: string;
  createdAt: string;
  deliveredAt?: string;
  cancellationReason?: string;
  returnReason?: string;
  refundStatus?: 'none' | 'processing' | 'refunded';
  refundAmount?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}

export interface Coupon {
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minOrder: number;
  description: string;
}

export interface MarketplaceAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
}

export interface MarketplaceSettings {
  defaultCommissionRate: number; // percentage, e.g. 8%
  freeDeliveryThreshold: number; // in INR
  standardDeliveryFee: number;
  marketplaceName: string;
  supportPhone: string;
  supportEmail: string;
}

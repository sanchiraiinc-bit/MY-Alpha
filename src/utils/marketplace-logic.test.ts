import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartTotals,
  calculateSellerSettlement,
  canCancelOrder,
  canReturnOrder,
  filterAndSortProducts,
  generateTrackingTimeline,
  validateSellerKyc,
} from './marketplace-logic';
import { CartItem, Product, Coupon, OrderItem } from '../types/marketplace';

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    title: 'AlphaPro Studio Laptop 16-inch M3',
    brand: 'AlphaTech',
    category: 'Electronics',
    subcategory: 'Laptops',
    price: 84999,
    originalPrice: 99999,
    discountPercent: 15,
    rating: 4.8,
    reviewCount: 320,
    deliveryDays: 2,
    deliveryFee: 0,
    stock: 12,
    inStock: true,
    sellerId: 'seller-1',
    sellerName: 'Apex Electronics Hub',
    sellerRating: 4.9,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80'],
    description: 'High performance laptop for development and design.',
    specifications: { RAM: '32GB', Storage: '1TB SSD', Processor: '12-Core' },
    tags: ['laptop', 'coding', 'programming', 'developer'],
    returnPolicy: '7 Days Replacement',
    warranty: '1 Year Brand Warranty',
    status: 'approved',
    isBestSeller: true,
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'prod-2',
    title: 'AlphaSonic Wireless ANC Headphones',
    brand: 'AlphaAudio',
    category: 'Electronics',
    subcategory: 'Audio',
    price: 4999,
    originalPrice: 8999,
    discountPercent: 44,
    rating: 4.6,
    reviewCount: 540,
    deliveryDays: 1,
    deliveryFee: 49,
    stock: 45,
    inStock: true,
    sellerId: 'seller-2',
    sellerName: 'SoundWave Direct',
    sellerRating: 4.7,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
    description: 'Crisp audio with 40-hour battery life and active noise cancellation.',
    specifications: { Battery: '40h', Drivers: '40mm', Bluetooth: '5.3' },
    tags: ['headphones', 'anc', 'wireless', 'music'],
    returnPolicy: '7 Days Replacement',
    warranty: '1 Year Warranty',
    status: 'approved',
    isDealOfTheDay: true,
    createdAt: '2026-02-15T10:00:00.000Z',
  },
  {
    id: 'prod-3',
    title: 'Pending Unapproved Smartwatch',
    brand: 'AlphaWatch',
    category: 'Electronics',
    subcategory: 'Wearables',
    price: 2999,
    originalPrice: 4999,
    discountPercent: 40,
    rating: 4.0,
    reviewCount: 5,
    deliveryDays: 3,
    deliveryFee: 49,
    stock: 20,
    inStock: true,
    sellerId: 'seller-1',
    sellerName: 'Apex Electronics Hub',
    sellerRating: 4.9,
    images: [],
    description: 'Smartwatch awaiting review.',
    specifications: {},
    tags: ['smartwatch'],
    returnPolicy: '7 Days',
    warranty: '1 Year',
    status: 'pending',
    createdAt: '2026-03-01T10:00:00.000Z',
  },
];

test('calculateCartTotals calculates accurate subtotal, coupon discounts and free delivery', () => {
  const items: CartItem[] = [
    { productId: 'prod-2', quantity: 1 }, // 4,999
  ];

  const coupon: Coupon = {
    code: 'ALPHAX10',
    discountPercent: 10,
    maxDiscount: 500,
    minOrder: 1000,
    description: '10% off up to 500',
  };

  const result = calculateCartTotals(items, mockProducts, coupon, 999, 49);

  assert.equal(result.subtotal, 4999);
  assert.equal(result.discountAmount, 500); // 10% of 4999 is 499.9 -> maxDiscount is 500
  assert.equal(result.isEligibleForFreeDelivery, true);
  assert.equal(result.deliveryFee, 0);
  assert.equal(result.totalAmount, 4499);
});

test('calculateCartTotals applies delivery fee when subtotal is below threshold', () => {
  const cheapProduct: Product = {
    ...mockProducts[1],
    id: 'prod-cheap',
    price: 499,
    originalPrice: 999,
  };
  const items: CartItem[] = [{ productId: 'prod-cheap', quantity: 1 }];

  const result = calculateCartTotals(items, [cheapProduct], null, 999, 49);

  assert.equal(result.subtotal, 499);
  assert.equal(result.isEligibleForFreeDelivery, false);
  assert.equal(result.deliveryFee, 49);
  assert.equal(result.amountNeededForFreeDelivery, 500);
  assert.equal(result.totalAmount, 548);
});

test('calculateSellerSettlement computes gross sales, 8% commission and 18% GST correctly', () => {
  const orderItem: OrderItem = {
    productId: 'prod-1',
    productTitle: 'Laptop',
    productImage: '',
    brand: 'AlphaTech',
    priceAtOrder: 10000,
    quantity: 1,
    sellerId: 'seller-1',
    sellerName: 'Apex Hub',
    status: 'placed',
  };

  const settlement = calculateSellerSettlement(orderItem, 8);

  assert.equal(settlement.grossSale, 10000);
  assert.equal(settlement.commission, 800); // 8% of 10000
  assert.equal(settlement.gstOnCommission, 144); // 18% of 800
  assert.equal(settlement.totalPlatformDeduction, 944);
  assert.equal(settlement.netPayout, 9056); // 10000 - 944
});

test('order cancellation is allowed before shipping but disallowed once shipped', () => {
  assert.equal(canCancelOrder('placed'), true);
  assert.equal(canCancelOrder('confirmed'), true);
  assert.equal(canCancelOrder('processing'), true);
  assert.equal(canCancelOrder('packed'), false);
  assert.equal(canCancelOrder('shipped'), false);
  assert.equal(canCancelOrder('delivered'), false);
});

test('order return is only eligible when status is delivered', () => {
  assert.equal(canReturnOrder('delivered'), true);
  assert.equal(canReturnOrder('shipped'), false);
  assert.equal(canReturnOrder('cancelled'), false);
});

test('filterAndSortProducts only shows approved products and matches search tokens', () => {
  // Should exclude prod-3 because status is 'pending'
  const searchResults = filterAndSortProducts(mockProducts, {
    searchQuery: 'laptop coding',
  });
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, 'prod-1');

  // Should find headphones by category
  const audioResults = filterAndSortProducts(mockProducts, {
    category: 'Electronics',
    subcategory: 'Audio',
  });
  assert.equal(audioResults.length, 1);
  assert.equal(audioResults[0].id, 'prod-2');
});

test('validateSellerKyc detects invalid inputs', () => {
  const invalid = validateSellerKyc({
    businessName: '',
    ownerName: '',
    email: 'not-an-email',
    phone: '123',
    gstNumber: 'short',
    panNumber: 'bad',
    accountNumber: '123',
    ifscCode: 'short',
  });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.length >= 6);

  const valid = validateSellerKyc({
    businessName: 'Apex Technologies Pvt Ltd',
    ownerName: 'Vikram Malhotra',
    email: 'contact@apextech.in',
    phone: '9876543210',
    gstNumber: '29ABCDE1234F1Z5',
    panNumber: 'ABCDE1234F',
    accountNumber: '918237462819',
    ifscCode: 'HDFC0001234',
  });
  assert.equal(valid.isValid, true);
  assert.equal(valid.errors.length, 0);
});

test('generateTrackingTimeline provides complete 7-stage sequence', () => {
  const timeline = generateTrackingTimeline('packed', '2026-11-08T10:00:00Z');
  assert.equal(timeline.length, 7);
  // 'placed', 'confirmed', 'processing', 'packed' should be done
  assert.equal(timeline[0].done, true);
  assert.equal(timeline[1].done, true);
  assert.equal(timeline[2].done, true);
  assert.equal(timeline[3].done, true);
  assert.equal(timeline[3].current, true);
  assert.equal(timeline[4].done, false);
});

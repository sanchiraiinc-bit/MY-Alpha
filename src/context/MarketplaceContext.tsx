import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Address,
  CartItem,
  Category,
  Coupon,
  Customer,
  MarketplaceAuditLog,
  MarketplaceSettings,
  Order,
  OrderStatus,
  Product,
  ProductReview,
  Seller,
  UserRole,
} from '../types/marketplace';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_CUSTOMER,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_SELLERS,
} from '../data/seedData';
import { calculateCartTotals, canCancelOrder, canReturnOrder } from '../utils/marketplace-logic';

interface LocationInfo {
  city: string;
  pincode: string;
  state: string;
}

interface MarketplaceContextType {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  products: Product[];
  sellers: Seller[];
  customer: Customer;
  orders: Order[];
  categories: Category[];
  coupons: Coupon[];
  reviews: ProductReview[];
  auditLogs: MarketplaceAuditLog[];
  settings: MarketplaceSettings;
  cart: CartItem[];
  appliedCoupon: Coupon | null;
  recentlyViewedIds: string[];
  comparisonProductIds: string[];
  currentSellerId: string;
  activeLocation: LocationInfo;
  setActiveLocation: (loc: LocationInfo) => void;

  // Cart operations
  addToCart: (productId: string, quantity?: number, color?: string, size?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  cartTotals: ReturnType<typeof calculateCartTotals>;

  // Wishlist & Comparison
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleCompare: (productId: string) => { success: boolean; message?: string };
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  recordProductView: (productId: string) => void;

  // Checkout & Orders
  placeOrder: (paymentMethod: Order['paymentMethod'], addressId: string) => Promise<Order>;
  cancelOrder: (orderId: string, reason: string) => boolean;
  requestReturn: (orderId: string, reason: string) => boolean;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Seller Operations
  currentSeller: Seller | undefined;
  switchSeller: (sellerId: string) => void;
  addSellerProduct: (
    product: Omit<Product, 'id' | 'createdAt' | 'status' | 'sellerId' | 'sellerName' | 'sellerRating'>
  ) => Product;
  updateProductStockAndPrice: (productId: string, newStock: number, newPrice?: number) => void;
  submitSellerKyc: (sellerId: string, kycData: Partial<Seller>) => void;
  registerNewSeller: (sellerData: Omit<Seller, 'id' | 'joinedDate' | 'performance' | 'totalSales' | 'totalOrders' | 'pendingPayout'>) => Seller;

  // Admin Operations
  approveSellerKyc: (sellerId: string) => void;
  rejectSellerKyc: (sellerId: string, reason: string) => void;
  approveProductListing: (productId: string) => void;
  rejectProductListing: (productId: string, reason: string) => void;
  updateCommissionRate: (rate: number) => void;
  addMarketplaceCategory: (category: Category) => void;

  // Customer Management
  addCustomerAddress: (address: Omit<Address, 'id'>) => Address;
  setDefaultAddress: (addressId: string) => void;

  // Reset
  resetToDefaultData: () => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | null>(null);

const STORAGE_KEY = 'alphax_marketplace_state_v1';

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<UserRole>('customer');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sellers, setSellers] = useState<Seller[]>(INITIAL_SELLERS);
  const [customer, setCustomer] = useState<Customer>(INITIAL_CUSTOMER);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [reviews, setReviews] = useState<ProductReview[]>(INITIAL_REVIEWS);
  const [auditLogs, setAuditLogs] = useState<MarketplaceAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [settings, setSettings] = useState<MarketplaceSettings>({
    defaultCommissionRate: 8,
    freeDeliveryThreshold: 999,
    standardDeliveryFee: 49,
    marketplaceName: 'ALPHA X Marketplace',
    supportPhone: '1800-ALPHA-X (Toll Free)',
    supportEmail: 'support@alphax.in',
  });

  const [cart, setCart] = useState<CartItem[]>([
    { productId: 'prod-anc-headphones', quantity: 1, selectedColor: 'Matte Black' },
  ]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(INITIAL_COUPONS[0]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([
    'prod-macbook-pro',
    'prod-anc-headphones',
    'prod-smart-curved-monitor',
  ]);
  const [comparisonProductIds, setComparisonProductIds] = useState<string[]>([]);
  const [currentSellerId, setCurrentSellerId] = useState<string>('seller-apex');
  const [activeLocation, setActiveLocation] = useState<LocationInfo>({
    city: 'Bengaluru',
    pincode: '560102',
    state: 'Karnataka',
  });

  // Load from LocalStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.sellers) setSellers(parsed.sellers);
        if (parsed.customer) setCustomer(parsed.customer);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.cart) setCart(parsed.cart);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
      }
    } catch (e) {
      console.warn('Failed to load state from storage:', e);
    }
  }, []);

  // Save to LocalStorage
  const saveState = (updated: {
    products?: Product[];
    sellers?: Seller[];
    customer?: Customer[];
    orders?: Order[];
    cart?: CartItem[];
  }) => {
    try {
      const payload = {
        products: updated.products || products,
        sellers: updated.sellers || sellers,
        customer: updated.customer || customer,
        orders: updated.orders || orders,
        cart: updated.cart || cart,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
  };

  const addAuditLog = (actor: string, role: string, action: string, details: string) => {
    const newLog: MarketplaceAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      actor,
      role,
      action,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Cart operations
  const addToCart = (productId: string, quantity = 1, color?: string, size?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.productId === productId &&
          (color ? i.selectedColor === color : true) &&
          (size ? i.selectedSize === size : true)
      );

      let nextCart: CartItem[];
      if (existingIndex > -1) {
        nextCart = [...prev];
        nextCart[existingIndex] = {
          ...nextCart[existingIndex],
          quantity: nextCart[existingIndex].quantity + quantity,
        };
      } else {
        nextCart = [...prev, { productId, quantity, selectedColor: color, selectedSize: size }];
      }
      saveState({ cart: nextCart });
      return nextCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const nextCart = prev.filter((i) => i.productId !== productId);
      saveState({ cart: nextCart });
      return nextCart;
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => {
      const nextCart = prev.map((i) => (i.productId === productId ? { ...i, quantity } : i));
      saveState({ cart: nextCart });
      return nextCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    saveState({ cart: [] });
  };

  const applyCoupon = (code: string) => {
    const found = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!found) {
      return { success: false, message: 'Invalid coupon code.' };
    }
    const totals = calculateCartTotals(cart, products);
    if (totals.subtotal < found.minOrder) {
      return {
        success: false,
        message: `Cart minimum of ₹${found.minOrder.toLocaleString('en-IN')} required for coupon ${found.code}.`,
      };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Coupon ${found.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const cartTotals = calculateCartTotals(
    cart,
    products,
    appliedCoupon,
    settings.freeDeliveryThreshold,
    settings.standardDeliveryFee
  );

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setCustomer((prev) => {
      const exists = prev.wishlist.includes(productId);
      const nextWishlist = exists
        ? prev.wishlist.filter((id) => id !== productId)
        : [...prev.wishlist, productId];
      return { ...prev, wishlist: nextWishlist };
    });
  };

  const isInWishlist = (productId: string) => {
    return customer.wishlist.includes(productId);
  };

  // Compare products (up to 4)
  const toggleCompare = (productId: string) => {
    if (comparisonProductIds.includes(productId)) {
      setComparisonProductIds((prev) => prev.filter((id) => id !== productId));
      return { success: true, message: 'Removed from comparison' };
    }
    if (comparisonProductIds.length >= 4) {
      return { success: false, message: 'You can compare up to 4 products simultaneously.' };
    }
    setComparisonProductIds((prev) => [...prev, productId]);
    return { success: true, message: 'Added to comparison list' };
  };

  const removeFromCompare = (productId: string) => {
    setComparisonProductIds((prev) => prev.filter((id) => id !== productId));
  };

  const clearCompare = () => {
    setComparisonProductIds([]);
  };

  const recordProductView = (productId: string) => {
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      return [productId, ...filtered].slice(0, 10);
    });
  };

  // Checkout and place order
  const placeOrder = async (
    paymentMethod: Order['paymentMethod'],
    addressId: string
  ): Promise<Order> => {
    const selectedAddress =
      customer.addresses.find((a) => a.id === addressId) || customer.addresses[0];
    const totals = cartTotals;

    // Build order items snapshots
    const orderItems = cart
      .map((cartItem) => {
        const prod = products.find((p) => p.id === cartItem.productId);
        if (!prod) return null;
        return {
          productId: prod.id,
          productTitle: prod.title,
          productImage: prod.images[0] || '',
          brand: prod.brand,
          priceAtOrder: prod.price,
          quantity: cartItem.quantity,
          selectedColor: cartItem.selectedColor,
          selectedSize: cartItem.selectedSize,
          sellerId: prod.sellerId,
          sellerName: prod.sellerName,
          status: 'placed' as OrderStatus,
        };
      })
      .filter(Boolean) as Order['items'];

    const newOrder: Order = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      shippingAddress: selectedAddress,
      items: orderItems,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      discountAmount: totals.discountAmount,
      couponCode: appliedCoupon?.code,
      totalAmount: totals.totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'completed',
      orderStatus: 'placed',
      trackingNumber: `AX-TRK-${Math.floor(1000000 + Math.random() * 9000000)}`,
      courierName: 'ALPHA Express Prime Logistics',
      estimatedDelivery: '3 - 4 Business Days',
      createdAt: new Date().toISOString(),
    };

    // Atomic stock reduction & seller totals update
    const updatedProducts = products.map((prod) => {
      const ordered = cart.find((c) => c.productId === prod.id);
      if (ordered) {
        const nextStock = Math.max(0, prod.stock - ordered.quantity);
        return {
          ...prod,
          stock: nextStock,
          inStock: nextStock > 0,
        };
      }
      return prod;
    });

    // Update affected sellers' sales & orders
    const updatedSellers = sellers.map((seller) => {
      const sellerItems = orderItems.filter((i) => i.sellerId === seller.id);
      if (sellerItems.length > 0) {
        const sellerGross = sellerItems.reduce((acc, i) => acc + i.priceAtOrder * i.quantity, 0);
        const commission = Math.round((sellerGross * settings.defaultCommissionRate) / 100);
        const net = sellerGross - commission;
        return {
          ...seller,
          totalSales: seller.totalSales + sellerGross,
          totalOrders: seller.totalOrders + 1,
          pendingPayout: seller.pendingPayout + net,
        };
      }
      return seller;
    });

    const updatedOrders = [newOrder, ...orders];
    setProducts(updatedProducts);
    setSellers(updatedSellers);
    setOrders(updatedOrders);
    clearCart();

    saveState({
      products: updatedProducts,
      sellers: updatedSellers,
      orders: updatedOrders,
      cart: [],
    });

    addAuditLog(
      customer.name,
      'Customer',
      'ORDER_CREATED',
      `Placed order ${newOrder.id} for ₹${newOrder.totalAmount.toLocaleString('en-IN')} via ${paymentMethod}`
    );

    return newOrder;
  };

  const cancelOrder = (orderId: string, reason: string): boolean => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder || !canCancelOrder(targetOrder.orderStatus)) {
      return false;
    }

    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: 'cancelled' as OrderStatus,
          cancellationReason: reason,
          refundStatus: o.paymentStatus === 'completed' ? ('refunded' as const) : ('none' as const),
          refundAmount: o.paymentStatus === 'completed' ? o.totalAmount : 0,
        };
      }
      return o;
    });

    // Restore stock
    const updatedProducts = products.map((prod) => {
      const item = targetOrder.items.find((i) => i.productId === prod.id);
      if (item) {
        return {
          ...prod,
          stock: prod.stock + item.quantity,
          inStock: true,
        };
      }
      return prod;
    });

    setOrders(updatedOrders);
    setProducts(updatedProducts);
    saveState({ orders: updatedOrders, products: updatedProducts });

    addAuditLog(
      customer.name,
      'Customer',
      'ORDER_CANCELLED',
      `Order ${orderId} was cancelled. Reason: ${reason}`
    );
    return true;
  };

  const requestReturn = (orderId: string, reason: string): boolean => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder || !canReturnOrder(targetOrder.orderStatus)) {
      return false;
    }

    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: 'return_requested' as OrderStatus,
          returnReason: reason,
          refundStatus: 'processing' as const,
        };
      }
      return o;
    });

    setOrders(updatedOrders);
    saveState({ orders: updatedOrders });

    addAuditLog(
      customer.name,
      'Customer',
      'RETURN_REQUESTED',
      `Customer initiated return on order ${orderId}. Reason: ${reason}`
    );
    return true;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: status,
          deliveredAt: status === 'delivered' ? new Date().toISOString() : o.deliveredAt,
          refundStatus: status === 'returned' ? ('refunded' as const) : o.refundStatus,
        };
      }
      return o;
    });
    setOrders(updatedOrders);
    saveState({ orders: updatedOrders });

    addAuditLog(
      'Fulfillment Service',
      'System',
      'ORDER_STATUS_UPDATED',
      `Order ${orderId} advanced to status "${status}"`
    );
  };

  // Seller operations
  const currentSeller = sellers.find((s) => s.id === currentSellerId) || sellers[0];

  const switchSeller = (sellerId: string) => {
    setCurrentSellerId(sellerId);
  };

  const addSellerProduct = (
    productData: Omit<
      Product,
      'id' | 'createdAt' | 'status' | 'sellerId' | 'sellerName' | 'sellerRating'
    >
  ): Product => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      sellerId: currentSeller.id,
      sellerName: currentSeller.businessName,
      sellerRating: currentSeller.performance.rating,
      status: 'pending', // Requires admin approval for trust and anti-fraud
      createdAt: new Date().toISOString(),
    };

    const nextProducts = [newProduct, ...products];
    setProducts(nextProducts);
    saveState({ products: nextProducts });

    addAuditLog(
      currentSeller.businessName,
      'Seller',
      'PRODUCT_LISTED',
      `Submitted product "${newProduct.title}" for catalog review`
    );

    return newProduct;
  };

  const updateProductStockAndPrice = (productId: string, newStock: number, newPrice?: number) => {
    const nextProducts = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          stock: newStock,
          inStock: newStock > 0,
          price: newPrice !== undefined ? newPrice : p.price,
        };
      }
      return p;
    });
    setProducts(nextProducts);
    saveState({ products: nextProducts });

    addAuditLog(
      currentSeller.businessName,
      'Seller',
      'INVENTORY_UPDATED',
      `Updated inventory for product ID ${productId}: stock=${newStock}`
    );
  };

  const submitSellerKyc = (sellerId: string, kycData: Partial<Seller>) => {
    const updatedSellers = sellers.map((s) => {
      if (s.id === sellerId) {
        return {
          ...s,
          ...kycData,
          kycStatus: 'pending' as const,
          kycSubmittedAt: new Date().toISOString(),
        };
      }
      return s;
    });
    setSellers(updatedSellers);
    saveState({ sellers: updatedSellers });

    addAuditLog(
      kycData.businessName || 'Seller',
      'Seller',
      'KYC_SUBMITTED',
      `Seller ${sellerId} submitted KYC verification documents`
    );
  };

  const registerNewSeller = (
    sellerData: Omit<
      Seller,
      'id' | 'joinedDate' | 'performance' | 'totalSales' | 'totalOrders' | 'pendingPayout'
    >
  ): Seller => {
    const newSeller: Seller = {
      ...sellerData,
      id: `seller-${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
      performance: {
        completionRate: 100,
        cancellationRate: 0,
        returnRate: 0,
        rating: 5.0,
        dispatchSpeed: '< 24 Hours',
      },
      totalSales: 0,
      totalOrders: 0,
      pendingPayout: 0,
    };

    const updatedSellers = [...sellers, newSeller];
    setSellers(updatedSellers);
    setCurrentSellerId(newSeller.id);
    saveState({ sellers: updatedSellers });

    addAuditLog(
      newSeller.businessName,
      'Seller',
      'SELLER_REGISTERED',
      `New seller ${newSeller.businessName} registered on ALPHA X platform`
    );

    return newSeller;
  };

  // Admin operations
  const approveSellerKyc = (sellerId: string) => {
    const updatedSellers = sellers.map((s) =>
      s.id === sellerId ? { ...s, kycStatus: 'approved' as const } : s
    );
    setSellers(updatedSellers);
    saveState({ sellers: updatedSellers });

    addAuditLog('Super Admin', 'Admin', 'KYC_APPROVED', `Approved KYC for seller ID ${sellerId}`);
  };

  const rejectSellerKyc = (sellerId: string, reason: string) => {
    const updatedSellers = sellers.map((s) =>
      s.id === sellerId ? { ...s, kycStatus: 'rejected' as const } : s
    );
    setSellers(updatedSellers);
    saveState({ sellers: updatedSellers });

    addAuditLog(
      'Super Admin',
      'Admin',
      'KYC_REJECTED',
      `Rejected KYC for seller ID ${sellerId}. Reason: ${reason}`
    );
  };

  const approveProductListing = (productId: string) => {
    const updatedProducts = products.map((p) =>
      p.id === productId ? { ...p, status: 'approved' as const } : p
    );
    setProducts(updatedProducts);
    saveState({ products: updatedProducts });

    addAuditLog(
      'Super Admin',
      'Admin',
      'PRODUCT_APPROVED',
      `Approved product listing ID ${productId} for live marketplace catalog`
    );
  };

  const rejectProductListing = (productId: string, reason: string) => {
    const updatedProducts = products.map((p) =>
      p.id === productId
        ? { ...p, status: 'rejected' as const, rejectionReason: reason }
        : p
    );
    setProducts(updatedProducts);
    saveState({ products: updatedProducts });

    addAuditLog(
      'Super Admin',
      'Admin',
      'PRODUCT_REJECTED',
      `Rejected product listing ID ${productId}. Reason: ${reason}`
    );
  };

  const updateCommissionRate = (rate: number) => {
    setSettings((prev) => ({ ...prev, defaultCommissionRate: rate }));
    addAuditLog(
      'Super Admin',
      'Admin',
      'COMMISSION_UPDATED',
      `Updated default marketplace commission rate to ${rate}%`
    );
  };

  const addMarketplaceCategory = (category: Category) => {
    setCategories((prev) => [...prev, category]);
    addAuditLog(
      'Super Admin',
      'Admin',
      'CATEGORY_ADDED',
      `Created new marketplace category "${category.name}"`
    );
  };

  // Customer addresses
  const addCustomerAddress = (addr: Omit<Address, 'id'>): Address => {
    const newAddr: Address = {
      ...addr,
      id: `addr-${Date.now()}`,
    };
    setCustomer((prev) => ({
      ...prev,
      addresses: [...prev.addresses, newAddr],
    }));
    return newAddr;
  };

  const setDefaultAddress = (addressId: string) => {
    setCustomer((prev) => ({
      ...prev,
      defaultAddressId: addressId,
      addresses: prev.addresses.map((a) => ({
        ...a,
        isDefault: a.id === addressId,
      })),
    }));
  };

  const resetToDefaultData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProducts(INITIAL_PRODUCTS);
    setSellers(INITIAL_SELLERS);
    setCustomer(INITIAL_CUSTOMER);
    setOrders(INITIAL_ORDERS);
    setCategories(INITIAL_CATEGORIES);
    setCoupons(INITIAL_COUPONS);
    setReviews(INITIAL_REVIEWS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCart([
      { productId: 'prod-anc-headphones', quantity: 1, selectedColor: 'Matte Black' },
    ]);
    setAppliedCoupon(INITIAL_COUPONS[0]);
    setComparisonProductIds([]);
  };

  return (
    <MarketplaceContext.Provider
      value={{
        activeRole,
        setActiveRole,
        products,
        sellers,
        customer,
        orders,
        categories,
        coupons,
        reviews,
        auditLogs,
        settings,
        cart,
        appliedCoupon,
        recentlyViewedIds,
        comparisonProductIds,
        currentSellerId,
        activeLocation,
        setActiveLocation,

        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        cartTotals,

        toggleWishlist,
        isInWishlist,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        recordProductView,

        placeOrder,
        cancelOrder,
        requestReturn,
        updateOrderStatus,

        currentSeller,
        switchSeller,
        addSellerProduct,
        updateProductStockAndPrice,
        submitSellerKyc,
        registerNewSeller,

        approveSellerKyc,
        rejectSellerKyc,
        approveProductListing,
        rejectProductListing,
        updateCommissionRate,
        addMarketplaceCategory,

        addCustomerAddress,
        setDefaultAddress,

        resetToDefaultData,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};

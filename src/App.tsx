import React, { useState } from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { MarketplaceHeader } from './components/navigation/MarketplaceHeader';
import { Homepage } from './components/customer/Homepage';
import { ProductListing } from './components/customer/ProductListing';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { OrderTrackingModal } from './components/customer/OrderTrackingModal';
import { ProductComparisonModal } from './components/customer/ProductComparisonModal';
import { AiShoppingModal } from './components/customer/AiShoppingModal';
import { WishlistModal } from './components/customer/WishlistModal';
import { CustomerSupportModal } from './components/support/CustomerSupportModal';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Product, Order } from './types/marketplace';
import {
  Home,
  Grid,
  Heart,
  ShoppingCart,
  Package,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Layers,
  ShieldAlert,
} from 'lucide-react';

function MarketplaceApp() {
  const { activeRole, setActiveRole, cartTotals, customer, products } = useMarketplace();

  // Navigation & Modal States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  const handleOpenProductById = (productId: string) => {
    const found = products.find((p) => p.id === productId);
    if (found) {
      setSelectedProduct(found);
    }
  };

  const handleOrderSuccess = (order: Order) => {
    setLastPlacedOrder(order);
    setIsTrackingOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Global Universal Header */}
      <MarketplaceHeader
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenOrders={() => setIsTrackingOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Main View Area based on Active Role */}
      <main className="flex-1">
        {activeRole === 'customer' && (
          <>
            {selectedCategory !== 'All' || searchQuery.trim() !== '' ? (
              <ProductListing
                category={selectedCategory}
                searchQuery={searchQuery}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onClearFilters={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
              />
            ) : (
              <Homepage
                onSelectProduct={(p) => setSelectedProduct(p)}
                onSelectCategory={(cat) => setSelectedCategory(cat)}
                onOpenAiAssistant={() => setIsAiModalOpen(true)}
              />
            )}
          </>
        )}

        {activeRole === 'seller' && (
          <React.Suspense fallback={<div className="p-12 text-center">Loading Seller Hub...</div>}>
            <SellerView />
          </React.Suspense>
        )}

        {activeRole === 'admin' && (
          <React.Suspense fallback={<div className="p-12 text-center">Loading Super Admin...</div>}>
            <AdminView />
          </React.Suspense>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 text-xs text-slate-400 py-12 pb-24 md:pb-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                  AX
                </div>
                <span className="font-display font-bold text-base text-white">ALPHA X</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                India-first multi-vendor e-commerce marketplace platform. Connects direct manufacturers
                and verified merchants with shoppers nationwide.
              </p>
              <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>DPDP 2025 & E-Commerce Rules Compliant</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white uppercase tracking-wider mb-3 text-xs">
                Marketplace Pillars
              </h4>
              <ul className="space-y-2 text-slate-400 text-[11px]">
                <li>
                  <button onClick={() => setActiveRole('customer')} className="hover:text-white">
                    Verified Customer Store
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveRole('seller')} className="hover:text-white">
                    Merchant Central & Onboarding
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveRole('admin')} className="hover:text-white">
                    Super Admin Control Panel
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsCompareOpen(true)} className="hover:text-white">
                    4-Product Comparison Tool
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white uppercase tracking-wider mb-3 text-xs">
                Consumer Trust & Grievance
              </h4>
              <ul className="space-y-2 text-slate-400 text-[11px]">
                <li>
                  <button onClick={() => setIsSupportOpen(true)} className="hover:text-white">
                    Grievance Officer Details
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsTrackingOpen(true)} className="hover:text-white">
                    7-Day Return Policy & Timeline
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsAiModalOpen(true)} className="hover:text-white">
                    AI Shopping Concierge
                  </button>
                </li>
                <li>
                  <span>100% Tax Invoices with GSTIN</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white uppercase tracking-wider mb-3 text-xs">
                Help & Contact
              </h4>
              <div className="space-y-2 text-[11px] text-slate-400">
                <p>Helpline: 1800-ALPHA-X (Toll Free)</p>
                <p>Email: support@alphax.in</p>
                <p>Fulfillment: ALPHA Express Prime</p>
                <button
                  onClick={() => setIsSupportOpen(true)}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium hover:border-indigo-500 transition"
                >
                  Raise Support Ticket
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© 2026 ALPHA X Technologies Private Limited. All Rights Reserved.</p>
            <p>Designed for India • Inspired by Amazon & Flipkart with Next-Gen AI Precision</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-around text-slate-400 text-[10px]">
        <button
          onClick={() => {
            setActiveRole('customer');
            setSelectedCategory('All');
            setSearchQuery('');
          }}
          className={`flex flex-col items-center gap-1 ${
            activeRole === 'customer' && selectedCategory === 'All' && !searchQuery
              ? 'text-cyan-400 font-bold'
              : 'hover:text-slate-200'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => {
            setActiveRole('customer');
            setSelectedCategory('Electronics');
          }}
          className={`flex flex-col items-center gap-1 ${
            selectedCategory !== 'All' ? 'text-indigo-400 font-bold' : 'hover:text-slate-200'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Categories</span>
        </button>

        <button
          onClick={() => setIsAiModalOpen(true)}
          className="flex flex-col items-center gap-1 text-cyan-300 font-semibold"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>AI Concierge</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 hover:text-slate-200"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Cart</span>
          {cartTotals.itemCount > 0 && (
            <span className="absolute -top-1 right-2 bg-indigo-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              {cartTotals.itemCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsTrackingOpen(true)}
          className="flex flex-col items-center gap-1 hover:text-slate-200"
        >
          <Package className="w-4 h-4" />
          <span>Orders</span>
        </button>
      </nav>

      {/* Modals & Drawers */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onOpenCheckoutDirectly={() => {
            setSelectedProduct(null);
            setIsCheckoutOpen(true);
          }}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onSelectProduct={handleOpenProductById}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        selectedOrder={lastPlacedOrder}
      />

      <ProductComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onSelectProduct={handleOpenProductById}
      />

      <AiShoppingModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      <CustomerSupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  );
}

// Lazy-loaded or modular view components for clean bundle split
function SellerView() {
  return <SellerDashboard />;
}

function AdminView() {
  return <AdminDashboard />;
}

export default function App() {
  return (
    <MarketplaceProvider>
      <MarketplaceApp />
    </MarketplaceProvider>
  );
}

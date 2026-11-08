import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  MapPin,
  Sparkles,
  Layers,
  Store,
  ShieldAlert,
  ChevronDown,
  RotateCcw,
  Scale,
  Mic,
  Camera,
  X,
  Package,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { UserRole, Address } from '../../types/marketplace';

interface HeaderProps {
  onOpenAiAssistant: () => void;
  onOpenCart: () => void;
  onOpenCompare: () => void;
  onOpenOrders: () => void;
  onOpenWishlist: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export const MarketplaceHeader: React.FC<HeaderProps> = ({
  onOpenAiAssistant,
  onOpenCart,
  onOpenCompare,
  onOpenOrders,
  onOpenWishlist,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}) => {
  const {
    activeRole,
    setActiveRole,
    cartTotals,
    customer,
    comparisonProductIds,
    activeLocation,
    setActiveLocation,
    currentSeller,
    sellers,
    switchSeller,
    products,
    resetToDefaultData,
  } = useMarketplace();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showSellerSelector, setShowSellerSelector] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Pending items counts for badges
  const pendingKycCount = sellers.filter((s) => s.kycStatus === 'pending').length;
  const pendingProductCount = products.filter((p) => p.status === 'pending').length;

  const handleVoiceSearch = () => {
    setVoiceActive(true);
    setTimeout(() => {
      setSearchQuery('laptop coding');
      setVoiceActive(false);
    }, 1200);
  };

  const handleImageSearchSimulation = () => {
    setSearchQuery('headphones');
  };

  const trendingQueries = ['ANC Headphones', 'M4 Laptop', 'QD-OLED Monitor', 'Espresso Machine'];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Banner: Multi-Vendor Platform Switcher */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium hidden sm:inline">Active Workspace:</span>
            <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-700">
              <button
                onClick={() => setActiveRole('customer')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium text-xs ${
                  activeRole === 'customer'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Customer Store</span>
              </button>

              <button
                onClick={() => setActiveRole('seller')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium text-xs ${
                  activeRole === 'seller'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Seller Hub</span>
                {currentSeller && (
                  <span className="hidden md:inline text-[10px] bg-amber-950/60 text-amber-200 px-1.5 py-0.2 rounded border border-amber-700/50">
                    {currentSeller.businessName.split(' ')[0]}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveRole('admin')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium text-xs ${
                  activeRole === 'admin'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Super Admin</span>
                {(pendingKycCount > 0 || pendingProductCount > 0) && (
                  <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {pendingKycCount + pendingProductCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            {activeRole === 'seller' && (
              <div className="relative">
                <button
                  onClick={() => setShowSellerSelector(!showSellerSelector)}
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium"
                >
                  <span>Managing: {currentSeller?.businessName}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showSellerSelector && (
                  <div className="absolute right-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-2 z-50">
                    <p className="text-[11px] text-slate-400 px-2 py-1 font-semibold uppercase">
                      Switch Seller Store
                    </p>
                    {sellers.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          switchSeller(s.id);
                          setShowSellerSelector(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs flex justify-between items-center transition ${
                          s.id === currentSeller?.id
                            ? 'bg-amber-600/20 text-amber-300 font-semibold'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="truncate">{s.businessName}</span>
                        <span
                          className={`text-[10px] px-1 rounded ${
                            s.kycStatus === 'approved'
                              ? 'text-emerald-400 bg-emerald-950'
                              : 'text-amber-400 bg-amber-950'
                          }`}
                        >
                          {s.kycStatus}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={resetToDefaultData}
              title="Reset sample marketplace data"
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>

            <span className="text-slate-500">|</span>
            <span className="text-indigo-400 font-semibold tracking-wider">INDIA MARKETPLACE</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Location */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => {
                setActiveRole('customer');
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="cursor-pointer group flex items-center gap-2"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition transform">
                <span className="font-extrabold text-white text-lg tracking-tighter">AX</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold tracking-tight text-lg text-white leading-none">
                  ALPHA <span className="text-cyan-400">X</span>
                </span>
                <span className="text-[10px] text-slate-400 tracking-wider font-medium uppercase">
                  Marketplace
                </span>
              </div>
            </div>

            {/* Location Selector */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition"
            >
              <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <div className="flex flex-col text-xs leading-tight">
                <span className="text-slate-400 text-[10px]">Deliver to</span>
                <span className="text-slate-200 font-medium truncate max-w-[120px]">
                  {activeLocation.city} {activeLocation.pincode}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
          </div>

          {/* Search Bar with AI & Voice Entry */}
          <div className="flex-1 max-w-2xl relative">
            <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition shadow-inner">
              <div className="pl-3.5 pr-2 text-slate-400">
                <Search className="w-4 h-4" />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search products, brands, or ask 'laptop for coding under 60k'..."
                className="w-full bg-transparent py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-200 mr-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Voice Search Simulation */}
              <button
                onClick={handleVoiceSearch}
                title="Voice Search"
                className={`p-2 transition rounded-lg mr-1 ${
                  voiceActive
                    ? 'text-rose-400 bg-rose-500/20 animate-pulse'
                    : 'text-slate-400 hover:text-cyan-400'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Image Search Simulation */}
              <button
                onClick={handleImageSearchSimulation}
                title="Visual Search by Image"
                className="p-2 text-slate-400 hover:text-cyan-400 transition rounded-lg mr-1.5"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* AI Shopping Assistant Trigger */}
              <button
                onClick={onOpenAiAssistant}
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-xs px-3.5 py-2 rounded-lg mr-1 shadow-sm transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                <span>AI Concierge</span>
              </button>
            </div>

            {/* Quick Trending Searches Suggestion Dropdown */}
            {searchFocused && !searchQuery && (
              <div
                onMouseDown={(e) => e.preventDefault()}
                className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-1"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-slate-300">Trending Searches in India</span>
                  <button
                    onClick={() => setSearchFocused(false)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    Close
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingQueries.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setSearchQuery(t);
                        setSearchFocused(false);
                      }}
                      className="px-2.5 py-1 text-xs rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Compare Floating Button */}
            {comparisonProductIds.length > 0 && (
              <button
                onClick={onOpenCompare}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/90 border border-cyan-700/60 text-cyan-300 text-xs font-semibold transition"
              >
                <Scale className="w-4 h-4" />
                <span className="hidden md:inline">Compare</span>
                <span className="bg-cyan-500 text-slate-950 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {comparisonProductIds.length}
                </span>
              </button>
            )}

            {/* Orders Tracker */}
            <button
              onClick={onOpenOrders}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs transition"
              title="My Orders & Tracking"
            >
              <Package className="w-4 h-4 text-indigo-400" />
              <span className="hidden md:inline font-medium">Orders</span>
            </button>

            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 sm:px-3 sm:py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs transition"
              title="Saved Wishlist"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              {customer.wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {customer.wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg font-medium text-xs shadow-md shadow-indigo-600/20 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">
                ₹{cartTotals.totalAmount.toLocaleString('en-IN')}
              </span>
              {cartTotals.itemCount > 0 && (
                <span className="bg-white text-indigo-700 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartTotals.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                Select Delivery Location
              </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Delivery options, live stock availability, and shipping speeds are personalized based
              on your delivery PIN code.
            </p>

            <div className="space-y-3 mb-6">
              {customer.addresses.map((addr: Address) => (
                <div
                  key={addr.id}
                  onClick={() => {
                    setActiveLocation({
                      city: addr.city,
                      pincode: addr.pincode,
                      state: addr.state,
                    });
                    setShowLocationModal(false);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-start justify-between ${
                    activeLocation.pincode === addr.pincode
                      ? 'border-indigo-500 bg-indigo-950/30'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white">{addr.fullName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {addr.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{addr.line1}</p>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                  {activeLocation.pincode === addr.pincode && (
                    <span className="text-xs text-cyan-400 font-semibold">Active</span>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowLocationModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

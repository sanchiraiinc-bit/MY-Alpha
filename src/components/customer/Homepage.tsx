import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle,
  Clock,
  ArrowRight,
  Laptop,
  Shirt,
  Home,
  Dumbbell,
} from 'lucide-react';
import { Product } from '../../types/marketplace';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ProductCard } from './ProductCard';

interface HomepageProps {
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (category: string) => void;
  onOpenAiAssistant: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({
  onSelectProduct,
  onSelectCategory,
  onOpenAiAssistant,
}) => {
  const { products, categories, sellers, recentlyViewedIds } = useMarketplace();

  // Simulated Flash Deal Countdown
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 15 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const approvedProducts = products.filter((p) => p.status === 'approved');
  const dealProducts = approvedProducts.filter((p) => p.isDealOfTheDay || p.discountPercent >= 30);
  const bestSellers = approvedProducts.filter((p) => p.isBestSeller);
  const trendingProducts = approvedProducts.filter((p) => p.isTrending);

  // Personalized recommendations
  const recentlyViewed = approvedProducts.filter((p) => recentlyViewedIds.includes(p.id));

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop':
        return <Laptop className="w-4 h-4 text-cyan-400" />;
      case 'Shirt':
        return <Shirt className="w-4 h-4 text-indigo-400" />;
      case 'Home':
        return <Home className="w-4 h-4 text-emerald-400" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'Dumbbell':
        return <Dumbbell className="w-4 h-4 text-rose-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Category Navigation Pills */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onSelectCategory('All')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 whitespace-nowrap transition"
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition"
            >
              {getCategoryIcon(cat.icon)}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Hero Banner: Premium Next-Gen Marketplace */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-900/40 p-6 md:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>ALPHA X Intelligence & Verified Multi-Vendor Network</span>
            </div>

            <h1 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight leading-tight mb-4">
              The Next-Gen Everything Store for India.
            </h1>

            <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-6">
              Shop directly from certified Indian manufacturers & brand owners. Guaranteed genuine
              products, transparent final pricing, sub-24h express dispatch, and instant UPI
              settlements.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onSelectCategory('Electronics')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition transform active:scale-95"
              >
                <span>Explore Electronics</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAiAssistant}
                className="px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold flex items-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Ask AI Shopping Assistant</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Trust: Solving the 20 Common Marketplace Problems */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-white">100% Verified Sellers</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                GSTIN & PAN verified. Zero fake duplicate listings.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-white">Transparent Final Bill</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                No surprise shipping charges at final checkout step.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-800/40">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-white">7-Stage Live Telemetry</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Accurate package tracking from seller dispatch to doorstep.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/40">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-white">Hassle-Free Returns</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                7-day replacement window with live refund status tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Today's Deals with Countdown */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-white">Today's Deals</h2>
                <p className="text-xs text-slate-400">
                  Exclusive daily discounts verified by our operations team
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">Ends in:</span>
              <span className="font-mono font-bold text-amber-300">
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {dealProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
            ))}
          </div>
        </div>

        {/* Section 2: Best Sellers */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-white">Best Sellers</h2>
                <p className="text-xs text-slate-400">
                  Most ordered items with verified 4.7★+ customer satisfaction
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectCategory('All')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
            ))}
          </div>
        </div>

        {/* Section 3: Trending Tech & Lifestyle */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-white">Trending Now</h2>
                <p className="text-xs text-slate-400">
                  Highest velocity products across metro and tier-2 hubs
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
            ))}
          </div>
        </div>

        {/* Section 4: Personalized Suggestions (Recently Viewed / Recommended) */}
        {recentlyViewed.length > 0 && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Personalized for You
                </h3>
                <p className="text-xs text-slate-400">Based on your recent browsing preferences</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentlyViewed.slice(0, 3).map((product) => (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/50 cursor-pointer transition group"
                >
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-16 h-16 object-contain rounded-lg bg-slate-900 p-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-200 font-medium truncate group-hover:text-cyan-400 transition">
                      {product.title}
                    </p>
                    <p className="text-xs font-bold text-white mt-1">
                      ₹{product.price.toLocaleString('en-IN')}
                    </p>
                    <span className="text-[10px] text-emerald-400">
                      ★ {product.rating.toFixed(1)} ({product.reviewCount})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 5: Featured Verified Sellers */}
        <div>
          <div className="mb-6">
            <h2 className="font-display font-bold text-xl text-white">Featured Certified Sellers</h2>
            <p className="text-xs text-slate-400">
              Top performing merchants meeting ALPHA X 98%+ fulfillment standards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sellers
              .filter((s) => s.kycStatus === 'approved')
              .map((seller) => (
                <div
                  key={seller.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-white">{seller.businessName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5" />
                        KYC Verified
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-3">
                      Managing partner: {seller.ownerName}
                    </p>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800 text-center">
                      <div>
                        <div className="text-xs font-bold text-white">
                          {seller.performance.rating}★
                        </div>
                        <div className="text-[10px] text-slate-400">Customer Rating</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-400">
                          {seller.performance.completionRate}%
                        </div>
                        <div className="text-[10px] text-slate-400">Completion</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-cyan-400">
                          {seller.performance.dispatchSpeed}
                        </div>
                        <div className="text-[10px] text-slate-400">Speed</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>GST: {seller.gstNumber.slice(0, 4)}...{seller.gstNumber.slice(-3)}</span>
                    <span className="text-indigo-400 font-medium">Verified Partner</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

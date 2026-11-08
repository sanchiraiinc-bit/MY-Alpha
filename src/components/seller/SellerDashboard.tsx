import React, { useState } from 'react';
import {
  Layers,
  Package,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Sparkles,
  Plus,
  CheckCircle,
  Truck,
  Building,
  FileCheck,
  RotateCcw,
  Star,
  Clock,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { generateSellerListingAI } from '../../services/geminiService';
import { calculateSellerSettlement, validateSellerKyc } from '../../utils/marketplace-logic';
import { OrderStatus, Product } from '../../types/marketplace';

export const SellerDashboard: React.FC = () => {
  const {
    currentSeller,
    sellers,
    switchSeller,
    products,
    orders,
    addSellerProduct,
    updateProductStockAndPrice,
    submitSellerKyc,
    updateOrderStatus,
    registerNewSeller,
    settings,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'add-product' | 'orders' | 'finance' | 'kyc'
  >('overview');

  // Filter items belonging to current seller
  const sellerProducts = products.filter((p) => p.sellerId === currentSeller?.id);
  const lowStockProducts = sellerProducts.filter((p) => p.stock <= 10);

  // Orders containing current seller's items
  const sellerOrders = orders.filter((o) =>
    o.items.some((item) => item.sellerId === currentSeller?.id)
  );

  // AI Product Listing Generator Form State
  const [productKeyword, setProductKeyword] = useState('');
  const [categoryHint, setCategoryHint] = useState('Electronics');
  const [approxPrice, setApproxPrice] = useState<number>(4999);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Generated / Editable product draft
  const [draftTitle, setDraftTitle] = useState('');
  const [draftCategory, setDraftCategory] = useState('Electronics');
  const [draftSubcategory, setDraftSubcategory] = useState('Accessories');
  const [draftPrice, setDraftPrice] = useState<number>(4999);
  const [draftOriginalPrice, setDraftOriginalPrice] = useState<number>(6999);
  const [draftStock, setDraftStock] = useState<number>(25);
  const [draftDescription, setDraftDescription] = useState('');
  const [draftImageUrl, setDraftImageUrl] = useState(
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
  );
  const [draftSpecs, setDraftSpecs] = useState<string>('Warranty: 1 Year\nBuild: Aerospace Grade');
  const [draftTags, setDraftTags] = useState<string>('gadget, tech, premium');
  const [productSubmitSuccess, setProductSubmitSuccess] = useState(false);

  // KYC Form State
  const [kycOwner, setKycOwner] = useState(currentSeller?.ownerName || '');
  const [kycGst, setKycGst] = useState(currentSeller?.gstNumber || '');
  const [kycPan, setKycPan] = useState(currentSeller?.panNumber || '');
  const [kycAccount, setKycAccount] = useState(currentSeller?.bankAccount.accountNumber || '');
  const [kycIfsc, setKycIfsc] = useState(currentSeller?.bankAccount.ifscCode || '');
  const [kycErrors, setKycErrors] = useState<string[]>([]);
  const [kycSubmittedMessage, setKycSubmittedMessage] = useState(false);

  if (!currentSeller) return null;

  // Handle AI generation for product
  const handleGenerateListingWithAI = async () => {
    if (!productKeyword.trim()) return;
    setIsGeneratingAi(true);

    try {
      const generated = await generateSellerListingAI({
        productKeyword,
        categoryHint,
        approxBudget: approxPrice,
      });

      setDraftTitle(generated.title);
      setDraftCategory(generated.category);
      setDraftSubcategory(generated.subcategory);
      setDraftDescription(generated.description);
      setDraftPrice(generated.suggestedPrice || approxPrice);
      setDraftOriginalPrice(Math.round((generated.suggestedPrice || approxPrice) * 1.35));
      setDraftTags(generated.tags.join(', '));

      const specLines = Object.entries(generated.specifications)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      setDraftSpecs(specLines);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim()) return;

    // Parse specs from lines
    const parsedSpecs: Record<string, string> = {};
    draftSpecs.split('\n').forEach((line) => {
      const [k, ...v] = line.split(':');
      if (k && v.length > 0) {
        parsedSpecs[k.trim()] = v.join(':').trim();
      }
    });

    const parsedTags = draftTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addSellerProduct({
      title: draftTitle,
      brand: currentSeller.businessName.split(' ')[0],
      category: draftCategory,
      subcategory: draftSubcategory,
      price: Number(draftPrice),
      originalPrice: Number(draftOriginalPrice),
      discountPercent: Math.round(
        ((draftOriginalPrice - draftPrice) / draftOriginalPrice) * 100
      ),
      rating: 5.0,
      reviewCount: 0,
      deliveryDays: 2,
      deliveryFee: 0,
      stock: Number(draftStock),
      inStock: draftStock > 0,
      images: [draftImageUrl],
      description: draftDescription,
      specifications: parsedSpecs,
      tags: parsedTags,
      returnPolicy: '7 Days Hassle-Free Replacement',
      warranty: '1 Year Brand Warranty',
    });

    setProductSubmitSuccess(true);
    setTimeout(() => {
      setProductSubmitSuccess(false);
      setActiveTab('products');
    }, 1800);
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateSellerKyc({
      businessName: currentSeller.businessName,
      ownerName: kycOwner,
      email: currentSeller.email,
      phone: currentSeller.phone,
      gstNumber: kycGst,
      panNumber: kycPan,
      accountNumber: kycAccount,
      ifscCode: kycIfsc,
    });

    if (!validation.isValid) {
      setKycErrors(validation.errors);
      return;
    }

    setKycErrors([]);
    submitSellerKyc(currentSeller.id, {
      ownerName: kycOwner,
      gstNumber: kycGst.toUpperCase(),
      panNumber: kycPan.toUpperCase(),
      bankAccount: {
        accountNumber: kycAccount,
        ifscCode: kycIfsc.toUpperCase(),
        bankName: currentSeller.bankAccount.bankName,
      },
    });

    setKycSubmittedMessage(true);
    setTimeout(() => setKycSubmittedMessage(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Seller Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 border border-amber-900/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              ALPHA X Merchant Central
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                currentSeller.kycStatus === 'approved'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}
            >
              <CheckCircle className="w-2.5 h-2.5" />
              KYC {currentSeller.kycStatus.toUpperCase()}
            </span>
          </div>

          <h1 className="font-display font-black text-2xl md:text-3xl text-white">
            {currentSeller.businessName}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registered Merchant ID: <span className="font-mono text-slate-200">{currentSeller.id}</span> •
            GSTIN: <span className="font-mono text-slate-200">{currentSeller.gstNumber}</span>
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              activeTab === 'overview'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              activeTab === 'products'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Inventory ({sellerProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('add-product')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'add-product'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Listing Co-Pilot</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              activeTab === 'orders'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fulfill Orders ({sellerOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              activeTab === 'finance'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Payouts & Settlements
          </button>
          <button
            onClick={() => setActiveTab('kyc')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              activeTab === 'kyc'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            KYC Compliance
          </button>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Gross Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-display font-black text-2xl text-white">
                ₹{currentSeller.totalSales.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-400 mt-1">Verified sales through ALPHA X</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Total Orders</span>
                <Package className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="font-display font-black text-2xl text-white">
                {currentSeller.totalOrders}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{sellerOrders.length} in current cycle</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Pending Payout</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="font-display font-black text-2xl text-amber-300">
                ₹{currentSeller.pendingPayout.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Next T+2 auto-settlement cycle</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Seller Rating</span>
                <Star className="w-4 h-4 text-amber-400" />
              </div>
              <div className="font-display font-black text-2xl text-white flex items-center gap-1.5">
                <span>{currentSeller.performance.rating.toFixed(1)}</span>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-[11px] text-emerald-400 mt-1">
                {currentSeller.performance.completionRate}% order completion
              </p>
            </div>
          </div>

          {/* Low Stock Alerts */}
          {lowStockProducts.length > 0 && (
            <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-900/50 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Low Inventory Stock Warning ({lowStockProducts.length} items)</span>
              </div>
              <p className="text-xs text-slate-300">
                Replenish inventory to avoid algorithmic demotion or automatic listing pause.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="truncate max-w-[180px]">
                      <p className="font-semibold text-white truncate">{p.title}</p>
                      <span className="text-rose-400 font-bold">Only {p.stock} units left</span>
                    </div>
                    <button
                      onClick={() => updateProductStockAndPrice(p.id, p.stock + 20)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg transition"
                    >
                      +20 Units
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seller Performance Metrics Matrix */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Merchant Performance Scorecard
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated every 24 hours to determine eligibility for ALPHA X Prime Badging and Buy Box
              placement.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                <span className="text-xs text-slate-400">Fulfillment Success</span>
                <p className="font-display font-black text-xl text-emerald-400 mt-1">
                  {currentSeller.performance.completionRate}%
                </p>
                <span className="text-[10px] text-slate-500">Benchmark: &gt; 97%</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                <span className="text-xs text-slate-400">Seller Cancellation</span>
                <p className="font-display font-black text-xl text-emerald-400 mt-1">
                  {currentSeller.performance.cancellationRate}%
                </p>
                <span className="text-[10px] text-slate-500">Benchmark: &lt; 2%</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                <span className="text-xs text-slate-400">Dispatch Speed</span>
                <p className="font-display font-black text-xl text-cyan-400 mt-1">
                  {currentSeller.performance.dispatchSpeed}
                </p>
                <span className="text-[10px] text-slate-500">Benchmark: &lt; 24h</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                <span className="text-xs text-slate-400">Customer Return Rate</span>
                <p className="font-display font-black text-xl text-amber-300 mt-1">
                  {currentSeller.performance.returnRate}%
                </p>
                <span className="text-[10px] text-slate-500">Benchmark: &lt; 4%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Inventory & Stock Management */}
      {activeTab === 'products' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-display font-bold text-base text-white">Live Inventory Catalog</h3>
              <p className="text-xs text-slate-400">
                Adjust stock levels and selling prices instantly without leaving the screen.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('add-product')}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>List New Product</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Selling Price (₹)</th>
                  <th className="py-3 px-3">Available Stock</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Quick Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {sellerProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-950/40 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-10 h-10 rounded-lg bg-slate-950 object-contain p-1 flex-shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-semibold text-white truncate">{p.title}</p>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {p.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {p.category} / {p.subcategory}
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      ₹{p.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold ${
                          p.stock <= 5 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          p.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : p.status === 'pending'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateProductStockAndPrice(p.id, Math.max(0, p.stock - 5))}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => updateProductStockAndPrice(p.id, p.stock + 10)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Add Product with AI Co-Pilot */}
      {activeTab === 'add-product' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* AI Generator Trigger */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-white">AI Listing Assistant</h3>
            </div>
            <p className="text-xs text-slate-400">
              Enter basic product keywords or concept. Our AI model will draft professional titles,
              SEO tags, standardized specifications, and marketing copy compliant with marketplace
              rules.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">
                  Product Name / Keyword
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mechanical Ergonomic Keyboard RGB Hot-swap"
                  value={productKeyword}
                  onChange={(e) => setProductKeyword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Category Hint</label>
                  <select
                    value={categoryHint}
                    onChange={(e) => setCategoryHint(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Beauty & Grooming">Beauty & Grooming</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Target Price (₹)</label>
                  <input
                    type="number"
                    value={approxPrice}
                    onChange={(e) => setApproxPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateListingWithAI}
                disabled={isGeneratingAi || !productKeyword.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>
                  {isGeneratingAi ? 'Generating Draft via AI...' : 'Auto-Generate Product Details'}
                </span>
              </button>
            </div>
          </div>

          {/* Product Listing Form */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-base text-white">Review & Publish Listing</h3>
            <p className="text-xs text-slate-400">
              Sellers must review all generated specifications before submitting for admin catalog
              moderation.
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Product Title</label>
                <input
                  type="text"
                  required
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="Standardized product title"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={draftPrice}
                    onChange={(e) => setDraftPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">MRP Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={draftOriginalPrice}
                    onChange={(e) => setDraftOriginalPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={draftStock}
                    onChange={(e) => setDraftStock(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Product Image URL</label>
                <input
                  type="url"
                  required
                  value={draftImageUrl}
                  onChange={(e) => setDraftImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Marketing Description</label>
                <textarea
                  rows={3}
                  value={draftDescription}
                  onChange={(e) => setDraftDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">
                  Standardized Specifications (One key: value per line)
                </label>
                <textarea
                  rows={3}
                  value={draftSpecs}
                  onChange={(e) => setDraftSpecs(e.target.value)}
                  placeholder="Battery: 40h&#10;Connectivity: Bluetooth 5.3"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Search Keywords / Tags</label>
                <input
                  type="text"
                  value={draftTags}
                  onChange={(e) => setDraftTags(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {productSubmitSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Submitted for Admin Moderation! Switching to inventory...</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!draftTitle.trim() || productSubmitSuccess}
                className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
              >
                <span>Submit Product for Catalog Approval</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: Fulfill Orders */}
      {activeTab === 'orders' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-display font-bold text-base text-white">Merchant Order Processing</h3>
          <p className="text-xs text-slate-400">
            Fulfill buyer orders within 24 hours to maintain 99%+ seller reliability metrics.
          </p>

          {sellerOrders.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center italic">
              No orders pending fulfillment for {currentSeller.businessName} at this time.
            </p>
          ) : (
            <div className="space-y-4">
              {sellerOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div>
                      <span className="font-mono font-bold text-white text-sm">{ord.id}</span>
                      <span className="text-slate-400 ml-2">
                        Customer: {ord.customerName} ({ord.shippingAddress.city},{' '}
                        {ord.shippingAddress.pincode})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Order Status:</span>
                      <span className="font-mono font-bold uppercase text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                        {ord.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Seller Items */}
                  <div className="space-y-2">
                    {ord.items
                      .filter((i) => i.sellerId === currentSeller.id)
                      .map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-slate-200">
                            {item.productTitle} × {item.quantity}
                          </span>
                          <span className="font-bold text-white">
                            ₹{(item.priceAtOrder * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Workflow Action Buttons */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500">
                      Tracking Code: {ord.trackingNumber}
                    </span>

                    <div className="flex items-center gap-2">
                      {ord.orderStatus === 'placed' && (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'confirmed')}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                        >
                          Confirm & Accept Order
                        </button>
                      )}
                      {(ord.orderStatus === 'confirmed' || ord.orderStatus === 'processing') && (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'packed')}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                        >
                          Mark as Packed
                        </button>
                      )}
                      {ord.orderStatus === 'packed' && (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'shipped')}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold"
                        >
                          Hand Over to Courier (Shipped)
                        </button>
                      )}
                      {ord.orderStatus === 'shipped' && (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'out_for_delivery')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                        >
                          Mark Out for Delivery
                        </button>
                      )}
                      {ord.orderStatus === 'out_for_delivery' && (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'delivered')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                        >
                          Confirm Final Delivery
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Finance & Settlements */}
      {activeTab === 'finance' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h3 className="font-display font-bold text-base text-white">
              Settlement Ledger & Commission Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Clear, transparent calculations compliant with Indian GST and payment aggregator guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Total Marketplace Gross Sales</span>
              <p className="font-display font-bold text-lg text-white">
                ₹{currentSeller.totalSales.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Marketplace Commission Tier</span>
              <p className="font-display font-bold text-lg text-amber-400">
                {settings.defaultCommissionRate}.0% (+18% GST)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Pending Settlement Payout</span>
              <p className="font-display font-bold text-lg text-emerald-400">
                ₹{currentSeller.pendingPayout.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <h4 className="font-semibold text-slate-200">How your payout is calculated (Example ₹1,000 Sale):</h4>
            <div className="space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Customer Paid Gross Amount:</span>
                <span className="text-white font-mono">₹1,000.00</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>ALPHA X Marketplace Fee ({settings.defaultCommissionRate}%):</span>
                <span className="font-mono">-₹80.00</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>18% GST on Marketplace Commission:</span>
                <span className="font-mono">-₹14.40</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-emerald-400 text-sm">
                <span>Net Credited to Verified Bank Account:</span>
                <span className="font-mono">₹905.60</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: KYC Verification */}
      {activeTab === 'kyc' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h3 className="font-display font-bold text-base text-white">
              Business & Identity (KYC) Verification
            </h3>
            <p className="text-xs text-slate-400">
              Compliant with the Consumer Protection (E-Commerce) Rules 2020 and Indian tax laws.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Current KYC Verification Status:</span>
              <p
                className={`font-mono font-bold text-sm uppercase mt-0.5 ${
                  currentSeller.kycStatus === 'approved'
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {currentSeller.kycStatus}
              </p>
            </div>
            {currentSeller.kycSubmittedAt && (
              <span className="text-slate-500">
                Submitted: {new Date(currentSeller.kycSubmittedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <form onSubmit={handleKycSubmit} className="space-y-4 text-xs max-w-xl">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Authorized Signatory / Owner Name
              </label>
              <input
                type="text"
                required
                value={kycOwner}
                onChange={(e) => setKycOwner(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">
                  GSTIN (15 Characters)
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={kycGst}
                  onChange={(e) => setKycGst(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">
                  PAN Number (10 Characters)
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={kycPan}
                  onChange={(e) => setKycPan(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Bank Account Number</label>
                <input
                  type="text"
                  required
                  value={kycAccount}
                  onChange={(e) => setKycAccount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">IFSC Code</label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={kycIfsc}
                  onChange={(e) => setKycIfsc(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase"
                />
              </div>
            </div>

            {kycErrors.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 space-y-1">
                {kycErrors.map((err, i) => (
                  <p key={i}>• {err}</p>
                ))}
              </div>
            )}

            {kycSubmittedMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>KYC documents updated and queued for super administrator audit!</span>
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition"
            >
              Update & Resubmit Verification
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

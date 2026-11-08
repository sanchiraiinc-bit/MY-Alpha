import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Store,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  FileText,
  Sliders,
  History,
  AlertCircle,
  Search,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Category } from '../../types/marketplace';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    sellers,
    orders,
    auditLogs,
    settings,
    categories,
    approveSellerKyc,
    rejectSellerKyc,
    approveProductListing,
    rejectProductListing,
    updateCommissionRate,
    addMarketplaceCategory,
    customer,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'sellers' | 'products' | 'orders' | 'commission' | 'categories' | 'audit'
  >('overview');

  const [rejectReason, setRejectReason] = useState('');
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [newCommission, setNewCommission] = useState(settings.defaultCommissionRate);
  const [commissionSaved, setCommissionSaved] = useState(false);

  // New Category Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatSubs, setNewCatSubs] = useState('');

  // Calculations for Marketplace GMV & Revenue
  const totalGMV = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalPlatformCommissions = Math.round((totalGMV * settings.defaultCommissionRate) / 100);

  const pendingSellers = sellers.filter((s) => s.kycStatus === 'pending');
  const pendingProducts = products.filter((p) => p.status === 'pending');

  const handleApproveKyc = (sellerId: string) => {
    approveSellerKyc(sellerId);
  };

  const handleRejectKyc = (sellerId: string) => {
    if (!rejectReason) return;
    rejectSellerKyc(sellerId, rejectReason);
    setRejectTargetId(null);
    setRejectReason('');
  };

  const handleApproveProduct = (productId: string) => {
    approveProductListing(productId);
  };

  const handleRejectProduct = (productId: string) => {
    if (!rejectReason) return;
    rejectProductListing(productId, rejectReason);
    setRejectTargetId(null);
    setRejectReason('');
  };

  const handleSaveCommission = (e: React.FormEvent) => {
    e.preventDefault();
    updateCommissionRate(Number(newCommission));
    setCommissionSaved(true);
    setTimeout(() => setCommissionSaved(false), 2000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const subcats = newCatSubs
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addMarketplaceCategory({
      id: newCatName.toLowerCase().replace(/\s+/g, '-'),
      name: newCatName.trim(),
      icon: 'Sparkles',
      subcategories: subcats.length > 0 ? subcats : ['General'],
    });

    setNewCatName('');
    setNewCatSubs('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-950 border border-rose-900/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
              ALPHA X Super Governance
            </span>
            <span className="text-[10px] bg-rose-950 border border-rose-800 text-rose-300 px-2 py-0.5 rounded-full font-bold">
              Level 4 Admin Access
            </span>
          </div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-white">
            Marketplace Control Operations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-vendor governance, KYC compliance, listing moderation, and commission
            rules.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              activeTab === 'overview'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('sellers')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'sellers'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>KYC Verification</span>
            {pendingSellers.length > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingSellers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'products'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Product Approvals</span>
            {pendingProducts.length > 0 && (
              <span className="bg-cyan-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingProducts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              activeTab === 'orders'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('commission')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              activeTab === 'commission'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Commissions & Fees
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              activeTab === 'categories'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              activeTab === 'audit'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Gross Merchandise Value (GMV)</span>
              <p className="font-display font-black text-2xl text-white mt-1">
                ₹{totalGMV.toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-emerald-400 mt-1 block">
                Total marketplace throughput
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">ALPHA X Platform Commission Revenue</span>
              <p className="font-display font-black text-2xl text-rose-400 mt-1">
                ₹{totalPlatformCommissions.toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                At {settings.defaultCommissionRate}% standard commission
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Registered Verified Sellers</span>
              <p className="font-display font-black text-2xl text-cyan-400 mt-1">
                {sellers.length}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {pendingSellers.length} awaiting KYC review
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Total Live Catalog Items</span>
              <p className="font-display font-black text-2xl text-white mt-1">
                {products.filter((p) => p.status === 'approved').length}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {pendingProducts.length} pending moderation
              </span>
            </div>
          </div>

          {/* Action Required Banner */}
          {(pendingSellers.length > 0 || pendingProducts.length > 0) && (
            <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-900/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-white">Pending Administrative Approvals</h4>
                  <p className="text-slate-300">
                    {pendingSellers.length} seller onboarding applications and{' '}
                    {pendingProducts.length} product listings need review.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {pendingSellers.length > 0 && (
                  <button
                    onClick={() => setActiveTab('sellers')}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold"
                  >
                    Review KYC
                  </button>
                )}
                {pendingProducts.length > 0 && (
                  <button
                    onClick={() => setActiveTab('products')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                  >
                    Review Products
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick System Health */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="font-semibold text-white">Regulatory & Compliance Health</h4>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span>Consumer Protection (E-Commerce) Rules 2020:</span>
                  <span className="text-emerald-400 font-bold">Compliant ✓</span>
                </div>
                <div className="flex justify-between">
                  <span>Digital Personal Data Protection Act (DPDP) 2025:</span>
                  <span className="text-emerald-400 font-bold">Active Shield ✓</span>
                </div>
                <div className="flex justify-between">
                  <span>RBI Payment Aggregator Directives 2025:</span>
                  <span className="text-emerald-400 font-bold">Separated Escrow ✓</span>
                </div>
                <div className="flex justify-between">
                  <span>GSTIN & Tax Invoices:</span>
                  <span className="text-emerald-400 font-bold">Automated Snapshot ✓</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="font-semibold text-white">Marketplace Quality Benchmark</h4>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span>Average Seller Dispatch:</span>
                  <span className="text-cyan-400 font-bold">&lt; 20 Hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Return Processing Time:</span>
                  <span className="text-cyan-400 font-bold">&lt; 48 Hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Zero-Counterfeit Verified Rate:</span>
                  <span className="text-emerald-400 font-bold">100.0%</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Shipping Express Logistics:</span>
                  <span className="text-slate-100 font-bold">ALPHA Prime Fleet</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Seller KYC Moderation */}
      {activeTab === 'sellers' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-display font-bold text-base text-white">
            Seller KYC Applications & Legal Verification
          </h3>
          <p className="text-xs text-slate-400">
            Verify official GSTIN, PAN, and bank accounts before authorizing merchant sales on ALPHA X.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="py-3 px-3">Business Name & Owner</th>
                  <th className="py-3 px-3">Tax Identifiers</th>
                  <th className="py-3 px-3">Settlement Bank</th>
                  <th className="py-3 px-3">KYC Status</th>
                  <th className="py-3 px-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {sellers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-950/40 transition">
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-white">{s.businessName}</p>
                      <p className="text-[11px] text-slate-400">Owner: {s.ownerName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {s.email} • {s.phone}
                      </p>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <p className="text-slate-200">GST: {s.gstNumber}</p>
                      <p className="text-slate-400">PAN: {s.panNumber}</p>
                    </td>

                    <td className="py-3.5 px-3">
                      <p className="text-slate-200">{s.bankAccount.bankName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Acc: {s.bankAccount.accountNumber} (IFSC: {s.bankAccount.ifscCode})
                      </p>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          s.kycStatus === 'approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : s.kycStatus === 'rejected'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {s.kycStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      {s.kycStatus === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApproveKyc(s.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectTargetId(s.id)}
                            className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-semibold text-xs transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Audit Complete</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rejection Modal Prompt */}
          {rejectTargetId && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900 text-xs space-y-3">
              <span className="font-semibold text-rose-300">
                Specify Reason for Rejection (Target ID: {rejectTargetId}):
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Invalid GSTIN checksum or unreadable bank document..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                />
                <button
                  onClick={() => handleRejectKyc(rejectTargetId)}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-bold"
                >
                  Submit Rejection
                </button>
                <button
                  onClick={() => setRejectTargetId(null)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Product Approvals */}
      {activeTab === 'products' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-display font-bold text-base text-white">Product Catalog Moderation</h3>
          <p className="text-xs text-slate-400">
            Prevent misleading specifications, prohibited products, or counterfeit items before they
            are visible to customers.
          </p>

          <div className="space-y-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.images[0]}
                    alt=""
                    className="w-14 h-14 rounded-xl object-contain bg-slate-900 p-1"
                  />
                  <div>
                    <h4 className="font-semibold text-white text-sm">{p.title}</h4>
                    <p className="text-slate-400">
                      Seller: {p.sellerName} • Category: {p.category} • Price: ₹
                      {p.price.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {p.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      p.status === 'approved'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : p.status === 'rejected'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {p.status}
                  </span>

                  {p.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveProduct(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                      >
                        Approve to Store
                      </button>
                      <button
                        onClick={() => handleRejectProduct(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: All Orders */}
      {activeTab === 'orders' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-display font-bold text-base text-white">All Marketplace Transactions</h3>
          <p className="text-xs text-slate-400">
            Comprehensive ledger of customer purchases, shipping status, and payment aggregator
            verification.
          </p>

          <div className="space-y-3">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm">{ord.id}</span>
                    <span className="text-slate-400">by {ord.customerName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {ord.paymentMethod}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Shipment to: {ord.shippingAddress.city}, {ord.shippingAddress.pincode} • Items:{' '}
                    {ord.items.length}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-display font-bold text-sm text-cyan-400">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </span>
                    <p className="text-[10px] text-slate-500">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span className="font-mono font-bold uppercase text-[10px] px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-200">
                    {ord.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Commissions & Financials */}
      {activeTab === 'commission' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 max-w-xl">
          <div>
            <h3 className="font-display font-bold text-base text-white">
              Marketplace Commission Rate Setting
            </h3>
            <p className="text-xs text-slate-400">
              Configure standard platform take-rate deducted from eligible seller orders.
            </p>
          </div>

          <form onSubmit={handleSaveCommission} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Default Commission Percentage (%):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={30}
                  step={0.5}
                  value={newCommission}
                  onChange={(e) => setNewCommission(Number(e.target.value))}
                  className="w-32 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-base font-bold"
                />
                <span className="text-slate-400">Current active rate: {settings.defaultCommissionRate}%</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-slate-400 text-xs">
              <span className="font-semibold text-slate-200">Economics Example:</span>
              <p>
                On an eligible sale of ₹10,000, ALPHA X receives ₹{newCommission * 100} gross commission,
                and ₹{newCommission * 18} is remitted towards 18% GST on electronic marketplace services.
              </p>
            </div>

            {commissionSaved && (
              <p className="text-emerald-400 font-semibold">
                Commission rate updated globally across all future settlements!
              </p>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition"
            >
              Save Global Commission Rate
            </button>
          </form>
        </div>
      )}

      {/* Tab 6: Category Management */}
      {activeTab === 'categories' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h3 className="font-display font-bold text-base text-white">Marketplace Taxonomy & Categories</h3>
            <p className="text-xs text-slate-400">
              Add new categories and subcategories without touching codebase files.
            </p>
          </div>

          <form onSubmit={handleAddCategory} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs max-w-xl">
            <span className="font-semibold text-white">Create New Category</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gaming & VR"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Subcategories (comma separated)</label>
                <input
                  type="text"
                  placeholder="Consoles, Headsets, Controllers"
                  value={newCatSubs}
                  onChange={(e) => setNewCatSubs(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
            >
              Add Category
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-white text-sm">{c.name}</span>
                <p className="text-slate-400">{c.subcategories.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="font-display font-bold text-base text-white">Immutable Platform Audit Trail</h3>
          </div>
          <p className="text-xs text-slate-400">
            Cryptographically timestamped activity logs of all sensitive merchant and governance actions.
          </p>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start justify-between text-xs font-mono"
              >
                <div>
                  <div className="flex items-center gap-2 text-[11px] mb-1">
                    <span className="font-bold text-cyan-400">{log.action}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300">{log.actor} ({log.role})</span>
                  </div>
                  <p className="text-slate-400 font-sans">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-500 whitespace-nowrap ml-4">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

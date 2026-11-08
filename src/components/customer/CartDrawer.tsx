import React, { useState } from 'react';
import {
  X,
  Trash2,
  Tag,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCheckout: () => void;
  onSelectProduct: (productId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOpenCheckout,
  onSelectProduct,
}) => {
  const {
    cart,
    products,
    removeFromCart,
    updateCartQuantity,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    cartTotals,
    coupons,
  } = useMarketplace();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isOpen) return null;

  const handleApplyCoupon = (code: string) => {
    const res = applyCoupon(code);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponError('');
      setCouponInput('');
      setTimeout(() => setCouponSuccess(''), 3000);
    } else {
      setCouponError(res.message);
      setCouponSuccess('');
      setTimeout(() => setCouponError(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-lg h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            <h2 className="font-display font-bold text-base text-white">Your Shopping Cart</h2>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-semibold">
              {cartTotals.itemCount} items
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-5 py-3 bg-indigo-950/40 border-b border-indigo-900/30 text-xs">
          {cartTotals.isEligibleForFreeDelivery ? (
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>You have unlocked Free Express Delivery!</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-indigo-200">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-cyan-300" />
                  <span>
                    Add ₹{cartTotals.amountNeededForFreeDelivery.toLocaleString('en-IN')} more for Free Delivery
                  </span>
                </span>
                <span className="font-bold">₹999 Goal</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (cartTotals.subtotal / 999) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-semibold text-sm text-slate-300">Your cart is empty</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore best sellers, trending tech gadgets, and verified merchant deals.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
              >
                Start Exploring
              </button>
            </div>
          ) : (
            cart.map((cartItem) => {
              const prod = products.find((p) => p.id === cartItem.productId);
              if (!prod) return null;

              return (
                <div
                  key={`${cartItem.productId}-${cartItem.selectedColor}-${cartItem.selectedSize}`}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex gap-3 items-center group"
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    onClick={() => {
                      onSelectProduct(prod.id);
                      onClose();
                    }}
                    className="w-20 h-20 object-contain rounded-xl bg-slate-900 p-2 cursor-pointer flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4
                      onClick={() => {
                        onSelectProduct(prod.id);
                        onClose();
                      }}
                      className="text-xs font-semibold text-white truncate cursor-pointer hover:text-cyan-400 transition"
                    >
                      {prod.title}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>Sold by: {prod.sellerName.split(' ')[0]}</span>
                      {cartItem.selectedColor && (
                        <span>• {cartItem.selectedColor}</span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-bold text-xs text-white">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                      {prod.originalPrice > prod.price && (
                        <span className="text-[10px] text-slate-500 line-through">
                          ₹{prod.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-800 rounded-lg bg-slate-900 overflow-hidden text-xs">
                        <button
                          onClick={() => updateCartQuantity(prod.id, cartItem.quantity - 1)}
                          className="px-2 py-0.5 text-slate-400 hover:text-white"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 font-bold text-white">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(prod.id, cartItem.quantity + 1)}
                          className="px-2 py-0.5 text-slate-400 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(prod.id)}
                        className="text-slate-500 hover:text-rose-400 transition p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Coupon Code Section */}
          {cart.length > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span>Apply Promo Coupon</span>
              </label>

              {appliedCoupon ? (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-xs text-emerald-400">
                      {appliedCoupon.code}
                    </span>
                    <p className="text-[11px] text-slate-300">{appliedCoupon.description}</p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-400 hover:underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code (e.g. ALPHAX10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 uppercase font-mono focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleApplyCoupon(couponInput)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition"
                    >
                      Apply
                    </button>
                  </div>

                  {couponError && <p className="text-[11px] text-rose-400">{couponError}</p>}
                  {couponSuccess && <p className="text-[11px] text-emerald-400">{couponSuccess}</p>}

                  {/* Quick Coupon Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {coupons.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => handleApplyCoupon(c.code)}
                        className="px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-indigo-300 font-mono transition"
                      >
                        {c.code} ({c.discountPercent}%)
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer: Transparent Bill Breakdown & Checkout Trigger */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-800 bg-slate-950 space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({cartTotals.itemCount} items)</span>
                <span className="text-white font-medium">
                  ₹{cartTotals.subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {cartTotals.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-₹{cartTotals.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Standard Delivery Fee</span>
                <span>
                  {cartTotals.deliveryFee === 0 ? (
                    <span className="text-emerald-400 font-semibold">FREE</span>
                  ) : (
                    `₹${cartTotals.deliveryFee}`
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                <span>Final Payable Amount</span>
                <span className="font-display text-lg text-cyan-400">
                  ₹{cartTotals.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              {cartTotals.totalSavings > 0 && (
                <p className="text-[11px] text-emerald-400 text-right font-medium">
                  You are saving ₹{cartTotals.totalSavings.toLocaleString('en-IN')} on this order!
                </p>
              )}
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenCheckout();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition transform active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Safe 256-Bit Encrypted Payments • RBI Compliant</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

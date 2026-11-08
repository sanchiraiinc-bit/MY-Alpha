import React from 'react';
import { X, Scale, Trash2, ShoppingCart, Star, CheckCircle2 } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (productId: string) => void;
}

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const { comparisonProductIds, products, removeFromCompare, clearCompare, addToCart } =
    useMarketplace();

  if (!isOpen) return null;

  const compareProducts = comparisonProductIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;

  // Collect union of all spec keys
  const allSpecKeys = Array.from(
    new Set(compareProducts.flatMap((p) => Object.keys(p.specifications)))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl my-6 shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display font-bold text-base text-white">
              Smart Product Comparison ({compareProducts.length}/4)
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {compareProducts.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-y-auto p-6 flex-1">
          {compareProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Scale className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No products in comparison</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click the compare icon on any product card or details modal to inspect specifications
                side-by-side.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="p-3 text-slate-400 font-medium w-40">Attribute</th>
                    {compareProducts.map((p) => (
                      <th key={p.id} className="p-3 w-64 align-top">
                        <div className="space-y-2 relative">
                          <button
                            onClick={() => removeFromCompare(p.id)}
                            className="absolute -top-1 -right-1 p-1 text-slate-500 hover:text-rose-400"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div
                            onClick={() => {
                              onSelectProduct(p.id);
                              onClose();
                            }}
                            className="cursor-pointer group"
                          >
                            <img
                              src={p.images[0]}
                              alt=""
                              className="w-24 h-24 object-contain rounded-xl bg-slate-950 p-2 mx-auto group-hover:scale-105 transition"
                            />
                            <p className="font-semibold text-white mt-2 line-clamp-2 group-hover:text-cyan-400 transition">
                              {p.title}
                            </p>
                          </div>

                          <div className="flex items-baseline gap-2">
                            <span className="font-display font-bold text-base text-white">
                              ₹{p.price.toLocaleString('en-IN')}
                            </span>
                            {p.originalPrice > p.price && (
                              <span className="text-[10px] text-slate-500 line-through">
                                ₹{p.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => addToCart(p.id, 1)}
                            className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/80">
                  {/* Rating */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Customer Rating</td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="p-3">
                        <div className="flex items-center gap-1 font-bold text-emerald-400">
                          <span>{p.rating.toFixed(1)}</span>
                          <Star className="w-3 h-3 fill-emerald-400" />
                          <span className="text-slate-500 font-normal">({p.reviewCount})</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Seller */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Seller & Rating</td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="p-3 text-slate-300">
                        <p className="font-medium text-white">{p.sellerName}</p>
                        <p className="text-[11px] text-indigo-400">{p.sellerRating}★ Verified</p>
                      </td>
                    ))}
                  </tr>

                  {/* Delivery */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Delivery Speed</td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="p-3 text-slate-300">
                        Est. {p.deliveryDays} Day Delivery ({p.deliveryFee === 0 ? 'FREE' : `+₹${p.deliveryFee}`})
                      </td>
                    ))}
                  </tr>

                  {/* Warranty */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Warranty</td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="p-3 text-slate-300">
                        {p.warranty}
                      </td>
                    ))}
                  </tr>

                  {/* Return Policy */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Return Policy</td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="p-3 text-slate-300">
                        {p.returnPolicy}
                      </td>
                    ))}
                  </tr>

                  {/* Dynamic Technical Specifications */}
                  {allSpecKeys.map((spec) => (
                    <tr key={spec}>
                      <td className="p-3 font-semibold text-slate-400">{spec}</td>
                      {compareProducts.map((p) => (
                        <td key={p.id} className="p-3 text-slate-200">
                          {p.specifications[spec] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

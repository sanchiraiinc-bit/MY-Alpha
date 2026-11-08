import React from 'react';
import { Star, Heart, Scale, ShoppingCart, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Product } from '../../types/marketplace';
import { useMarketplace } from '../../context/MarketplaceContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    comparisonProductIds,
    recordProductView,
  } = useMarketplace();

  const isFavorited = isInWishlist(product.id);
  const isCompared = comparisonProductIds.includes(product.id);

  const handleCardClick = () => {
    recordProductView(product.id);
    onSelect(product);
  };

  return (
    <div className="group relative flex flex-col bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5">
      {/* Top badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex flex-col gap-1">
          {product.isDealOfTheDay && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow uppercase tracking-wider">
              Deal of Day
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-cyan-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow uppercase tracking-wider">
              Best Seller
            </span>
          )}
          {product.discountPercent > 0 && !product.isDealOfTheDay && !product.isBestSeller && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Compare Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(product.id);
            }}
            title={isCompared ? 'Remove from comparison' : 'Compare product'}
            className={`p-2 rounded-xl backdrop-blur-md transition ${
              isCompared
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
          </button>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
            className={`p-2 rounded-xl backdrop-blur-md transition ${
              isFavorited
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-400 text-rose-400' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Image container */}
      <div
        onClick={handleCardClick}
        className="cursor-pointer relative aspect-square w-full bg-slate-950 overflow-hidden flex items-center justify-center p-4"
      >
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-2 left-2 bg-rose-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
            Only {product.stock} left!
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div onClick={handleCardClick} className="cursor-pointer">
          {/* Brand & Seller */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-indigo-400 tracking-wide uppercase text-[10px]">
              {product.brand}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span className="truncate max-w-[100px]">{product.sellerName.split(' ')[0]}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="font-medium text-sm text-slate-100 line-clamp-2 group-hover:text-cyan-400 transition mb-2">
            {product.title}
          </h3>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800/80 text-emerald-400 font-bold text-xs">
              <span>{product.rating.toFixed(1)}</span>
              <Star className="w-3 h-3 fill-emerald-400" />
            </div>
            <span className="text-xs text-slate-400">({product.reviewCount})</span>
            {product.verifiedPurchaseOnly && (
              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400" />
                Verified
              </span>
            )}
          </div>
        </div>

        <div>
          {/* Price & Delivery */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-display font-bold text-lg text-white">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-slate-500 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {product.discountPercent > 0 && (
              <span className="text-xs font-semibold text-emerald-400">
                {product.discountPercent}% off
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 mb-3 flex items-center justify-between">
            <span>
              {product.deliveryFee === 0 ? (
                <span className="text-emerald-400 font-medium">Free Delivery</span>
              ) : (
                <span>+₹{product.deliveryFee} shipping</span>
              )}
            </span>
            <span className="text-slate-400">Est. {product.deliveryDays} Day</span>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={() => addToCart(product.id, 1)}
            disabled={!product.inStock}
            className={`w-full py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition ${
              product.inStock
                ? 'bg-slate-800 hover:bg-indigo-600 text-slate-100 hover:text-white border border-slate-700 hover:border-indigo-500 shadow-sm'
                : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

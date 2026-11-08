import React, { useState } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Scale,
  Heart,
  ShoppingCart,
  Share2,
  Video,
  Image as ImageIcon,
  Zap,
} from 'lucide-react';
import { Product } from '../../types/marketplace';
import { useMarketplace } from '../../context/MarketplaceContext';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onOpenCheckoutDirectly?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenCheckoutDirectly,
}) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    comparisonProductIds,
    reviews,
  } = useMarketplace();

  const [activeMediaTab, setActiveMediaTab] = useState<'images' | 'video'>('images');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.variants?.colors?.[0]
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.variants?.sizes?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const isCompared = comparisonProductIds.includes(product.id);

  const productReviews = reviews.filter((r) => r.productId === product.id);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddToCart = () => {
    addToCart(product.id, quantity, selectedColor, selectedSize);
  };

  const handleBuyNow = () => {
    addToCart(product.id, quantity, selectedColor, selectedSize);
    if (onOpenCheckoutDirectly) {
      onOpenCheckoutDirectly();
    }
  };

  // Transparent final price breakdown BEFORE checkout
  const finalPriceWithDelivery = product.price * quantity + (product.deliveryFee || 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl my-8 overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
              {product.brand}
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-400">{product.category}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition"
              title="Share listing"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-8 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Gallery & Video Preview */}
            <div className="lg:col-span-6 space-y-4">
              {/* Media Switcher */}
              {product.videoUrl && (
                <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 w-fit">
                  <button
                    onClick={() => setActiveMediaTab('images')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      activeMediaTab === 'images'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Photos ({product.images.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveMediaTab('video')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      activeMediaTab === 'video'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Video Demo</span>
                  </button>
                </div>
              )}

              {/* Main Display */}
              <div className="relative aspect-square w-full rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center p-6">
                {activeMediaTab === 'video' && product.videoUrl ? (
                  <video
                    src={product.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <img
                    src={product.images[selectedImageIndex] || product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-contain"
                  />
                )}

                {/* Floating Wishlist */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`absolute top-4 right-4 p-3 rounded-2xl backdrop-blur-md transition ${
                    isFavorited
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${isFavorited ? 'fill-rose-400 text-rose-400' : ''}`}
                  />
                </button>
              </div>

              {/* Thumbnail Bar */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedImageIndex(idx);
                        setActiveMediaTab('images');
                      }}
                      className={`relative w-16 h-16 rounded-xl bg-slate-950 border overflow-hidden p-1 flex-shrink-0 transition ${
                        selectedImageIndex === idx && activeMediaTab === 'images'
                          ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Title, Ratings, Pricing, Variants & Purchase */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <h1 className="font-display font-bold text-2xl text-white leading-snug">
                  {product.title}
                </h1>

                {/* Seller & Rating Bar */}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold text-xs">
                    <span>{product.rating.toFixed(1)}</span>
                    <Star className="w-3.5 h-3.5 fill-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-400">
                    {product.reviewCount} Verified Ratings
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-cyan-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    100% Genuine Guaranteed
                  </span>
                </div>
              </div>

              {/* Transparent Pricing Card */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="font-display font-black text-3xl text-white">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm text-slate-500 line-through">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  {product.discountPercent > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Save {product.discountPercent}%
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400">Inclusive of all applicable GST & taxes.</p>

                {/* Final Price Preview to solve Unexpected Delivery Charges */}
                <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                  <span>Transparent Final Amount ({quantity} item):</span>
                  <span className="font-bold text-white">
                    ₹{finalPriceWithDelivery.toLocaleString('en-IN')}{' '}
                    <span className="text-[10px] text-emerald-400 font-normal">
                      ({product.deliveryFee === 0 ? 'Free Shipping' : `+₹${product.deliveryFee} Shipping`})
                    </span>
                  </span>
                </div>
              </div>

              {/* Color Variants */}
              {product.variants?.colors && product.variants.colors.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">
                    Color: <span className="text-cyan-400 font-normal">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                          selectedColor === c
                            ? 'border-indigo-500 bg-indigo-950/40 text-cyan-300 font-bold'
                            : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size / Storage Variants */}
              {product.variants?.sizes && product.variants.sizes.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">
                    Configuration: <span className="text-cyan-400 font-normal">{selectedSize}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                          selectedSize === s
                            ? 'border-indigo-500 bg-indigo-950/40 text-cyan-300 font-bold'
                            : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock & Quantity */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-800 rounded-xl bg-slate-950 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-slate-400 hover:text-white transition"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-xs font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 text-slate-400 hover:text-white transition"
                  >
                    +
                  </button>
                </div>

                <div className="text-xs">
                  {product.stock > 0 ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      In Stock ({product.stock} units available)
                    </span>
                  ) : (
                    <span className="text-rose-400 font-medium">Currently Out of Stock</span>
                  )}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
                >
                  <ShoppingCart className="w-4 h-4 text-cyan-400" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-95"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Compare Button */}
              <button
                onClick={() => toggleCompare(product.id)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  isCompared
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{isCompared ? 'Remove from Comparison' : 'Add to Compare (Up to 4)'}</span>
              </button>

              {/* Seller Information & Performance Scorecard */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-[11px] text-slate-400">Sold & Fulfilled by</p>
                      <h4 className="text-xs font-bold text-white">{product.sellerName}</h4>
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300 font-bold">
                    {product.sellerRating}★ Seller
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center text-[11px]">
                  <div>
                    <span className="text-emerald-400 font-bold">99.2%</span>
                    <p className="text-slate-400 text-[10px]">Fulfillment</p>
                  </div>
                  <div>
                    <span className="text-cyan-400 font-bold">&lt; 18h</span>
                    <p className="text-slate-400 text-[10px]">Dispatch Speed</p>
                  </div>
                  <div>
                    <span className="text-slate-300 font-bold">0.8%</span>
                    <p className="text-slate-400 text-[10px]">Cancellation Rate</p>
                  </div>
                </div>
              </div>

              {/* Policies: Returns & Warranty */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start gap-2.5">
                  <RotateCcw className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200 block">
                      {product.returnPolicy}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Doorstep pickup & instant replacement
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start gap-2.5">
                  <Truck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200 block">
                      Est. {product.deliveryDays} Day Delivery
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Via ALPHA Express Prime Logistics
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Technical Specifications */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-lg text-white">Product Description</h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {product.description}
            </p>

            <h3 className="font-display font-bold text-base text-white pt-4">
              Standardized Technical Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {Object.entries(product.specifications).map(([key, val]) => (
                <div
                  key={key}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                >
                  <span className="text-slate-400">{key}</span>
                  <span className="text-slate-100 font-medium">{val}</span>
                </div>
              ))}
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400">Warranty</span>
                <span className="text-slate-100 font-medium">{product.warranty}</span>
              </div>
            </div>
          </div>

          {/* Verified Customer Reviews */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white">
                Verified Customer Reviews ({productReviews.length})
              </h3>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Only verified purchases can review
              </span>
            </div>

            {productReviews.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No reviews yet for this newly launched batch. Be the first verified buyer to leave
                feedback!
              </p>
            ) : (
              <div className="space-y-3">
                {productReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">{rev.customerName}</span>
                        {rev.verifiedPurchase && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-medium">
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">{rev.date}</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

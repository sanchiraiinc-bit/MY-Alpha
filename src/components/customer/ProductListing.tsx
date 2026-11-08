import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Check, Star } from 'lucide-react';
import { Product } from '../../types/marketplace';
import { useMarketplace } from '../../context/MarketplaceContext';
import { filterAndSortProducts } from '../../utils/marketplace-logic';
import { ProductCard } from './ProductCard';

interface ProductListingProps {
  category: string;
  searchQuery: string;
  onSelectProduct: (product: Product) => void;
  onClearFilters: () => void;
}

export const ProductListing: React.FC<ProductListingProps> = ({
  category,
  searchQuery,
  onSelectProduct,
  onClearFilters,
}) => {
  const { products } = useMarketplace();

  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<
    'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'discount'
  >('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Available brands in current category
  const availableBrands = useMemo(() => {
    const list = products
      .filter((p) => p.status === 'approved' && (category === 'All' || p.category === category))
      .map((p) => p.brand);
    return ['All', ...Array.from(new Set(list))];
  }, [products, category]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(products, {
      searchQuery,
      category,
      minPrice,
      maxPrice,
      brand: selectedBrand,
      minRating,
      inStockOnly,
      sortBy,
    });
  }, [products, searchQuery, category, minPrice, maxPrice, selectedBrand, minRating, inStockOnly, sortBy]);

  const hasActiveFilters =
    category !== 'All' ||
    Boolean(searchQuery) ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    selectedBrand !== 'All' ||
    minRating !== undefined ||
    inStockOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Bar: Results Count & Sort Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="font-display font-bold text-xl text-white">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : category !== 'All'
              ? `${category} Collection`
              : 'All Marketplace Products'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Showing <span className="text-white font-semibold">{filteredProducts.length}</span>{' '}
            verified items
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200"
          >
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="featured" className="bg-slate-900">
                Featured & Popular
              </option>
              <option value="price-asc" className="bg-slate-900">
                Price: Low to High
              </option>
              <option value="price-desc" className="bg-slate-900">
                Price: High to Low
              </option>
              <option value="rating" className="bg-slate-900">
                Highest Customer Rating
              </option>
              <option value="discount" className="bg-slate-900">
                Biggest Discount
              </option>
              <option value="newest" className="bg-slate-900">
                New Arrivals
              </option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setMinPrice(undefined);
                setMaxPrice(undefined);
                setSelectedBrand('All');
                setMinRating(undefined);
                setInStockOnly(false);
                onClearFilters();
              }}
              className="hidden sm:flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Sidebar Filters */}
        <aside
          className={`${
            mobileFilterOpen ? 'block' : 'hidden'
          } md:block bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-6`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              Refine Search
            </h3>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setMinPrice(undefined);
                  setMaxPrice(undefined);
                  setSelectedBrand('All');
                  setMinRating(undefined);
                  setInStockOnly(false);
                }}
                className="text-[11px] text-indigo-400 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Availability */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              Availability
            </h4>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              Price Range (₹)
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice ?? ''}
                onChange={(e) =>
                  setMinPrice(e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-slate-500 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice ?? ''}
                onChange={(e) =>
                  setMaxPrice(e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Brand Filter */}
          {availableBrands.length > 2 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                Brand
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {availableBrands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                      selectedBrand === b
                        ? 'bg-indigo-600/20 text-cyan-300 font-semibold'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{b}</span>
                    {selectedBrand === b && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customer Rating Filter */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              Customer Rating
            </h4>
            <div className="space-y-1.5">
              {[4.5, 4.0, 3.5].map((ratingThreshold) => (
                <button
                  key={ratingThreshold}
                  onClick={() =>
                    setMinRating(minRating === ratingThreshold ? undefined : ratingThreshold)
                  }
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                    minRating === ratingThreshold
                      ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 font-bold'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span>{ratingThreshold}★ & above</span>
                  </span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Cards Grid */}
        <div className="md:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-white">No Matching Products</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try loosening your filters or searching for alternate keywords. All items on ALPHA X
                are verified by certified merchants.
              </p>
              <button
                onClick={() => {
                  setMinPrice(undefined);
                  setMaxPrice(undefined);
                  setSelectedBrand('All');
                  setMinRating(undefined);
                  setInStockOnly(false);
                  onClearFilters();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} onSelect={onSelectProduct} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

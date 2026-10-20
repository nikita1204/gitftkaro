'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ArrowLeft,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux.js';
import {
  fetchProducts,
  fetchCategories,
  setCategoryFilter,
  setSearchFilter,
  setSortFilter,
  setSizeFilter,
  setPage,
  resetFilters,
} from '@/redux/slices/productSlice.js';
import { Input } from '@/components/ui/Input.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Loader } from '@/components/ui/Loader.jsx';
import { EmptyState } from '@/components/ui/EmptyState.jsx';
import { ErrorState } from '@/components/ui/ErrorState.jsx';
import { ProductCard } from '@/components/products/ProductCard.jsx';

const SIZES = ['S', 'M', 'L', 'XL', '2XL'];

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { products, categories, pagination, filters, isLoading, error } = useAppSelector(
    (state) => state.products
  );

  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Initial fetch of categories
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fetch products whenever filters change
  useEffect(() => {
    dispatch(
      fetchProducts({
        page: filters.page,
        limit: 8,
        category: filters.category || undefined,
        search: filters.search || undefined,
        sort: filters.sort,
        size: filters.size || undefined,
      })
    );
  }, [dispatch, filters]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setSearchFilter(searchInput.trim()));
  };

  const handleClearFilters = () => {
    setSearchInput('');
    dispatch(resetFilters());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-stone-500">
        <Link href="/" className="hover:text-stone-900 transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Home
        </Link>
        <span>/</span>
        <span className="text-stone-900 font-medium">All Custom Apparel</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
              Raipur Operational Hub
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
              MOQ: 10 Pcs
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight mt-2">
            Custom Apparel Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Industrial screen & DTF printing on 100% bio-washed cotton. Dispatched within 24 hours across selected areas of Raipur, Chhattisgarh subject to eligibility.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80">
          <Input
            placeholder="Search custom t-shirts..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-stone-400" />}
            rightIcon={
              searchInput ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    dispatch(setSearchFilter(''));
                  }}
                  className="text-xs text-stone-400 hover:text-stone-700 font-medium"
                >
                  Clear
                </button>
              ) : null
            }
          />
        </form>
      </div>

      {/* Controls Bar: Category Pills, Size Filter & Sorting */}
      <div className="space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => dispatch(setCategoryFilter(''))}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              !filters.category
                ? 'bg-brand-500 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            All Categories ({pagination?.total || 0})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => dispatch(setCategoryFilter(cat.slug))}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center space-x-1.5 ${
                filters.category === cat.slug
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-50 border border-stone-200'
              }`}
            >
              <span>{cat.name}</span>
              {cat.productCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-600">
                  {cat.productCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Secondary Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-stone-200 text-xs shadow-xs">
          {/* Size Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-stone-500 font-medium">Filter Size:</span>
            <div className="flex space-x-1">
              <button
                onClick={() => dispatch(setSizeFilter(''))}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                  !filters.size
                    ? 'bg-brand-500 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                All
              </button>
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => dispatch(setSizeFilter(size))}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                    filters.size === size
                      ? 'bg-brand-500 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-stone-500 font-medium">Sort By:</span>
            <select
              value={filters.sort}
              onChange={(e) => dispatch(setSortFilter(e.target.value))}
              className="bg-stone-50 text-stone-800 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-brand-500 transition-colors"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="name_asc">Name: A to Z</option>
            </select>

            {(filters.category || filters.search || filters.size) && (
              <button
                onClick={handleClearFilters}
                className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 text-[11px]"
                title="Reset all filters"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader size="lg" text="Loading GIFT KRO custom apparel..." />
        </div>
      ) : error ? (
        <ErrorState
          title="Could not load catalogue"
          description={error}
          onRetry={() => dispatch(fetchProducts(filters))}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="No t-shirts match your search"
          description="Try broadening your category filter, clearing your search term, or selecting a different size."
          actionText="Reset All Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="space-y-8">
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination?.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-stone-200">
              <span className="text-xs text-stone-500">
                Showing Page <strong className="text-stone-900">{pagination.page}</strong> of{' '}
                <strong className="text-stone-900">{pagination.totalPages}</strong> ({pagination.total}{' '}
                custom items)
              </span>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => dispatch(setPage(pagination.page - 1))}
                  disabled={!pagination.hasPrevPage}
                  variant="outline"
                  size="sm"
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => dispatch(setPage(pg))}
                    className={`h-8 w-8 rounded-xl text-xs font-bold transition-all ${
                      pagination.page === pg
                        ? 'bg-brand-500 text-white shadow-xs'
                        : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <Button
                  onClick={() => dispatch(setPage(pagination.page + 1))}
                  disabled={!pagination.hasNextPage}
                  variant="outline"
                  size="sm"
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

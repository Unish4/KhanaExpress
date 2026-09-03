import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Star, Clock, Compass, Filter, X, UtensilsCrossed } from 'lucide-react';
import useRestaurantStore from '../store/useRestaurantStore';
import useDebounce from '../hooks/useDebounce';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CartDrawer from '../components/cart/CartDrawer';
import SkeletonLoader from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';

const CUISINES = [
  'All',
  'Pizza',
  'Burgers',
  'Momo',
  'Chinese',
  'Indian',
  'Desserts',
  'Beverages',
];

export const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCuisine = searchParams.get('cuisine') || 'All';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState(
    initialCuisine.charAt(0).toUpperCase() + initialCuisine.slice(1)
  );
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { restaurants, fetchRestaurants, loading } = useRestaurantStore();
  const navigate = useNavigate();

  useEffect(() => {
    const params = {};
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (selectedCuisine !== 'All') params.cuisine = selectedCuisine.toLowerCase();
    if (onlyOpen) params.isOpen = true;
    if (minRating > 0) params.rating = { gte: minRating };

    fetchRestaurants(params);
  }, [debouncedSearch, selectedCuisine, onlyOpen, minRating, fetchRestaurants]);

  const handleCuisineSelect = (c) => {
    setSelectedCuisine(c);
    if (c === 'All') {
      searchParams.delete('cuisine');
    } else {
      searchParams.set('cuisine', c.toLowerCase());
    }
    setSearchParams(searchParams);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCuisine('All');
    setOnlyOpen(false);
    setMinRating(0);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar onSearchChange={setSearchQuery} searchValue={searchQuery} />
      <CartDrawer />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Banner Section */}
        <div className="relative rounded-3xl p-6 sm:p-10 mb-8 overflow-hidden bg-gradient-to-r from-orange-100 via-orange-50 to-amber-100 border border-orange-200">
          <div className="relative z-10 max-w-xl">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#c2410c] bg-white px-3 py-1 rounded-full border border-orange-200 shadow-2xs mb-3">
              Delivering in Kathmandu
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
              Discover local favorites
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mb-6">
              Explore 200+ restaurants, fresh meals, and fast doorstep delivery.
            </p>

            {/* Mobile Search Bar */}
            <div className="flex md:hidden items-center bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
              <Search className="w-4 h-4 text-slate-400 ml-2" />
              <input
                type="text"
                placeholder="Search restaurants or dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 outline-none text-slate-900 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="absolute right-[-40px] bottom-[-40px] opacity-15 pointer-events-none">
            <Compass className="w-80 h-80 text-[#f97316]" />
          </div>
        </div>

        {/* Cuisine Filter Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {CUISINES.map((c) => {
            const isSelected = selectedCuisine.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                onClick={() => handleCuisineSelect(c)}
                className={`px-4 py-2 rounded-full text-xs font-semibold flex-shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#f97316] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              {selectedCuisine === 'All' ? 'All Restaurants' : `${selectedCuisine} Places`}
            </h2>
            {!loading && (
              <span className="text-xs text-slate-400 font-medium">
                ({restaurants.length} available)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={onlyOpen}
                onChange={(e) => setOnlyOpen(e.target.checked)}
                className="rounded border-slate-300 text-[#f97316] focus:ring-[#f97316]"
              />
              <span>Open Now Only</span>
            </label>

            {(searchQuery || selectedCuisine !== 'All' || onlyOpen || minRating > 0) && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Restaurant Card Grid */}
        {loading ? (
          <SkeletonLoader type="card" count={6} />
        ) : restaurants.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="No restaurants found"
            description="No dining spots matched your search parameters. Try clearing filters or searching for another dish."
            actionLabel="Reset Filters"
            onAction={handleClearFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((r) => {
              const imageUrl =
                r.image?.url ||
                'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=320&fit=crop&auto=format';
              const cuisines = Array.isArray(r.cuisine) ? r.cuisine.join(', ') : 'Multi-Cuisine';

              return (
                <div
                  key={r._id}
                  onClick={() => navigate(`/restaurants/${r._id}`)}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer overflow-hidden group flex flex-col"
                >
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={r.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {!r.isOpen && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <span className="bg-slate-900/80 text-white font-bold text-xs px-3 py-1 rounded-full border border-slate-700">
                          Closed
                        </span>
                      </div>
                    )}

                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-xs font-bold text-slate-900 flex items-center gap-1 shadow-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {r.rating || 4.5}
                    </div>

                    {r.isHighlyRated && (
                      <span className="absolute top-3 left-3 bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        Top Rated
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-[#f97316] transition-colors">
                        {r.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 capitalize truncate">
                        {cuisines}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-3 mt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {r.deliveryTime || 30} min
                      </span>
                      <span>·</span>
                      <span className="text-emerald-700 font-semibold">
                        {r.deliveryFee === 0 ? 'Free delivery' : `₹${r.deliveryFee}`}
                      </span>
                      <span>·</span>
                      <span>Min ₹{r.minimumOrder || r.minimumFee || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Browse;

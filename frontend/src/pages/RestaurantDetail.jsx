import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, Clock, MapPin, Phone, ShoppingBag, ArrowRight } from 'lucide-react';
import useRestaurantStore from '../store/useRestaurantStore';
import useCartStore from '../store/useCartStore';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CartDrawer from '../components/cart/CartDrawer';
import VegIndicator from '../components/common/VegIndicator';
import QuantityStepper from '../components/common/QuantityStepper';
import SkeletonLoader from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { currentRestaurant, menu, fetchRestaurant, loading } = useRestaurantStore();
  const { cart, addItem, updateQuantity, openCart, getCartCount, getSubtotal } = useCartStore();

  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    if (id) {
      fetchRestaurant(id);
    }
  }, [id, fetchRestaurant]);

  if (loading || !currentRestaurant) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Navbar />
        <div className="max-w-6xl w-full mx-auto px-4 py-8 flex-1">
          <SkeletonLoader type="detail" />
        </div>
        <Footer />
      </div>
    );
  }

  // Extract unique categories from menu items
  const categories = ['all', ...new Set(menu.map((item) => item.category || 'main-course'))];

  const filteredMenu =
    activeCategory === 'all'
      ? menu
      : menu.filter((item) => (item.category || 'main-course') === activeCategory);

  const cartCount = getCartCount();
  const subtotal = getSubtotal();

  const getCartItemQuantity = (itemId) => {
    const cartItem = cart.find((i) => (i._id || i.id || i.menuItem) === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddDish = (dish) => {
    addItem(dish, currentRestaurant);
  };

  const coverUrl =
    currentRestaurant.image?.url ||
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&h=400&fit=crop&auto=format';
  const cuisines = Array.isArray(currentRestaurant.cuisine)
    ? currentRestaurant.cuisine.join(' · ')
    : 'Multi-Cuisine';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Back Link */}
        <Link
          to="/restaurants"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#f97316] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to restaurants
        </Link>

        {/* Cover Header Banner */}
        <div className="relative rounded-3xl overflow-hidden mb-8 shadow-md bg-slate-900 h-56 sm:h-72">
          <img
            src={coverUrl}
            alt={currentRestaurant.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="orange" className="capitalize">
                  {currentRestaurant.isOpen ? 'Open Now' : 'Closed'}
                </Badge>
                {currentRestaurant.isHighlyRated && (
                  <Badge variant="purple">Top Rated</Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {currentRestaurant.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 capitalize">
                {cuisines}
              </p>
              {currentRestaurant.address?.street && (
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />{' '}
                  {currentRestaurant.address.street},{' '}
                  {currentRestaurant.address.city}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-lg">
                <Star className="w-5 h-5 fill-amber-400" />
                <span>{currentRestaurant.rating || 4.5}</span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div className="text-xs text-slate-200">
                <p className="font-semibold text-white">
                  {currentRestaurant.deliveryTime || 30} min
                </p>
                <p className="text-[10px] text-slate-300">
                  {currentRestaurant.deliveryFee === 0
                    ? 'Free delivery'
                    : `NPR ${currentRestaurant.deliveryFee} delivery`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
            Menu Items ({menu.length})
          </h2>

          {/* Menu Category Filter Pills */}
          {categories.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-100 no-scrollbar">
              {categories.map((cat) => {
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold capitalize flex-shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#f97316] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.replace('-', ' ')}
                  </button>
                );
              })}
            </div>
          )}

          {/* Dish List */}
          {filteredMenu.length === 0 ? (
            <EmptyState
              title="No dishes in this category"
              description="Check back later for newly added items from this restaurant."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredMenu.map((dish) => {
                const dishId = dish._id || dish.id;
                const qty = getCartItemQuantity(dishId);
                const dishImage = dish.image?.url || dish.imageUrl;

                return (
                  <div
                    key={dishId}
                    className="py-4 flex items-start justify-between gap-4 hover:bg-slate-50/50 p-2 rounded-xl transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <VegIndicator
                          isVeg={dish.isVegetarian ?? dish.isVeg ?? false}
                          size={14}
                        />
                        <h3 className="font-bold text-sm text-slate-900">
                          {dish.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">
                        {dish.description || 'Freshly prepared specialty dish.'}
                      </p>
                      <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                        NPR {dish.price}
                      </span>
                    </div>

                    {/* Dish Photo & Stepper Button */}
                    <div className="relative flex-shrink-0">
                      {dishImage ? (
                        <img
                          src={dishImage}
                          alt={dish.name}
                          className="w-20 h-20 rounded-xl object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-orange-50 text-[#f97316] font-bold text-xl flex items-center justify-center border border-orange-100">
                          {dish.name.charAt(0)}
                        </div>
                      )}

                      <div className="absolute -bottom-2 right-1/2 translate-x-1/2 shadow-md rounded-lg bg-white">
                        {qty === 0 ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddDish(dish)}
                            className="text-xs px-3 py-1 bg-white hover:bg-[#f97316] hover:text-white"
                          >
                            Add
                          </Button>
                        ) : (
                          <QuantityStepper
                            size="sm"
                            quantity={qty}
                            onChange={(newQty) => updateQuantity(dishId, newQty)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Floating Active Cart Widget Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[92%] bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-800 flex items-center justify-between animate-slideUp">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f97316] flex items-center justify-center text-white font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">{cartCount} items in cart</p>
              <p className="text-xs text-slate-400">
                Total: <span className="text-white font-bold">NPR {subtotal}</span>
              </p>
            </div>
          </div>

          <Button variant="primary" size="sm" onClick={openCart}>
            View Cart <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RestaurantDetail;

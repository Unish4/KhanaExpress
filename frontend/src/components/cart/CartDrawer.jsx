import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight, Trash2, MessageSquare } from 'lucide-react';
import useCartStore from '../../store/useCartStore';
import QuantityStepper from '../common/QuantityStepper';
import VegIndicator from '../common/VegIndicator';
import Button from '../common/Button';

export const CartDrawer = () => {
  const {
    cart,
    restaurant,
    isOpen,
    closeCart,
    updateQuantity,
    updateInstructions,
    removeItem,
    clearCart,
    getSubtotal,
    getCartCount,
  } = useCartStore();

  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const deliveryFee = restaurant?.deliveryFee || 0;
  const TAX_RATE = 0.13;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax + deliveryFee) * 100) / 100;
  const itemCount = getCartCount();

  const handleProceedToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col z-10 border-l border-slate-200 animate-slideLeft">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#f97316]" /> Your Cart
              </h2>
              {restaurant && (
                <p className="text-xs text-slate-500 truncate max-w-[240px]">
                  From <span className="font-semibold text-slate-700">{restaurant.name}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs font-medium text-slate-400 hover:text-red-600 transition-colors p-1"
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={closeCart}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#f97316] mb-4">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Your cart is empty
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mb-6 leading-relaxed">
                  Explore top restaurants in Kathmandu and add delicious meals to your cart.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    closeCart();
                    navigate('/restaurants');
                  }}
                >
                  Explore Restaurants
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => {
                  const targetId = item._id || item.id || item.menuItem;
                  return (
                    <div
                      key={targetId}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-orange-50 text-[#f97316] flex items-center justify-center font-bold text-base flex-shrink-0">
                            {item.name.charAt(0)}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <VegIndicator isVeg={item.isVegetarian} size={12} />
                            <h4 className="font-semibold text-xs text-slate-900 truncate">
                              {item.name}
                            </h4>
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            ₹{item.price}{' '}
                            <span className="text-[11px] font-normal text-slate-400">
                              each
                            </span>
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <QuantityStepper
                            size="sm"
                            quantity={item.quantity}
                            onChange={(qty) => updateQuantity(targetId, qty)}
                          />
                          <span className="text-xs font-bold text-slate-900 tabular-nums">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Special Instructions Field */}
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <input
                          type="text"
                          placeholder="Special instructions (e.g. extra spicy)"
                          value={item.specialInstructions || ''}
                          onChange={(e) =>
                            updateInstructions(targetId, e.target.value)
                          }
                          className="w-full text-[11px] bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-slate-800 outline-none focus:border-[#f97316] focus:bg-white"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer & Price Breakdown */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    ₹{subtotal}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery Fee</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (13%)</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    ₹{tax}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-[#f97316] text-base tabular-nums">
                    ₹{total}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleProceedToCheckout}
                className="shadow-lg hover:shadow-orange-500/20"
              >
                Proceed to Checkout ({itemCount}) <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;

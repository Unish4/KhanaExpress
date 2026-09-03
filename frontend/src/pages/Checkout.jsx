import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  CreditCard,
  Banknote,
  Smartphone,
  Plus,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Home,
  Briefcase,
  Globe,
  Store,
  ShieldCheck,
} from 'lucide-react';

import useCartStore from '../store/useCartStore';
import useAddressStore from '../store/useAddressStore';
import useOrderStore from '../store/useOrderStore';
import useAuthStore from '../store/useAuthStore';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import VegIndicator from '../components/common/VegIndicator';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

export const Checkout = () => {
  const { cart, restaurant, getSubtotal, clearCart } = useCartStore();
  const { addresses, defaultAddress, fetchAddresses, addAddress, loading: addressLoading } =
    useAddressStore();
  const { createOrder, loading: orderLoading } = useOrderStore();
  const { isAuthenticated, user } = useAuthStore();

  const navigate = useNavigate();

  // Selected Address State
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [customAddress, setCustomAddress] = useState({
    street: '',
    city: 'Kathmandu',
    zip: '',
    instructions: '',
  });
  const [useCustomAddress, setUseCustomAddress] = useState(false);

  // Address Modal State
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    label: 'home',
    street: '',
    city: 'Kathmandu',
    zip: '',
    instructions: '',
    isDefault: false,
  });
  const [addressErrors, setAddressErrors] = useState({});

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated, fetchAddresses]);

  useEffect(() => {
    if (addresses.length > 0) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(def._id);
    } else {
      setUseCustomAddress(true);
    }
  }, [addresses]);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 flex items-center justify-center">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="You need to add items to your cart before proceeding to checkout."
            actionLabel="Browse Restaurants"
            onAction={() => navigate('/restaurants')}
          />
        </main>
        <Footer />
      </div>
    );
  }

  const subtotal = getSubtotal();
  const deliveryFee = restaurant?.deliveryFee || 0;
  const TAX_RATE = 0.13;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

  // Address Modal submit
  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!newAddressForm.street.trim()) errors.street = 'Street address is required';
    if (!newAddressForm.city.trim()) errors.city = 'City is required';

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }

    try {
      const created = await addAddress(newAddressForm);
      if (created?._id) {
        setSelectedAddressId(created._id);
        setUseCustomAddress(false);
      }
      setAddressModalOpen(false);
    } catch (err) {}
  };

  // Place Order Submit
  const handlePlaceOrder = async () => {
    let deliveryAddress = {};

    if (useCustomAddress || addresses.length === 0) {
      if (!customAddress.street.trim()) {
        toast.error('Please enter a delivery street address');
        return;
      }
      deliveryAddress = {
        street: customAddress.street.trim(),
        city: customAddress.city.trim() || 'Kathmandu',
        zip: customAddress.zip.trim(),
        instructions: customAddress.instructions.trim(),
      };
    } else {
      const selected = addresses.find((a) => a._id === selectedAddressId);
      if (!selected) {
        toast.error('Please select a delivery address');
        return;
      }
      deliveryAddress = {
        street: selected.street,
        city: selected.city,
        zip: selected.zip || '',
        instructions: selected.instructions || '',
      };
    }

    const orderPayload = {
      restaurant: restaurant._id || restaurant.id,
      items: cart.map((item) => ({
        menuItem: item.menuItem || item._id || item.id,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions || '',
      })),
      deliveryAddress,
      paymentMethod,
    };

    try {
      const createdOrder = await createOrder(orderPayload);
      clearCart();
      navigate(`/orders/${createdOrder._id}/track`);
    } catch (err) {
      // Handled via toast in useOrderStore
    }
  };

  const labelIcons = {
    home: Home,
    work: Briefcase,
    other: Globe,
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <Link
          to={restaurant ? `/restaurants/${restaurant._id || restaurant.id}` : '/restaurants'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#f97316] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to restaurant
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Delivery Address & Payment Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery Address */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#f97316] flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h2 className="text-base font-bold text-slate-900">
                    Delivery Address
                  </h2>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddressModalOpen(true)}
                  icon={Plus}
                >
                  Add New
                </Button>
              </div>

              {/* Saved Addresses List */}
              {addresses.length > 0 && !useCustomAddress ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => {
                    const IconComp = labelIcons[addr.label] || MapPin;
                    const isSelected = selectedAddressId === addr._id;

                    return (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`p-4 rounded-xl border-1.5 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#f97316] bg-[#fff7ed]/40 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <IconComp className="w-4 h-4 text-[#f97316]" />
                            <span className="text-xs font-bold text-slate-900 capitalize">
                              {addr.label}
                            </span>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-[#f97316]" />
                          )}
                        </div>

                        <p className="text-xs font-semibold text-slate-800">
                          {addr.street}
                        </p>
                        <p className="text-xs text-slate-500">
                          {addr.city} {addr.zip ? `· ${addr.zip}` : ''}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {/* Custom Address Toggle / Input */}
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setUseCustomAddress(!useCustomAddress)}
                  className="text-xs font-semibold text-[#f97316] hover:underline pt-1 inline-block"
                >
                  {useCustomAddress
                    ? '← Select from saved addresses'
                    : '+ Enter a different address for this order'}
                </button>
              )}

              {(useCustomAddress || addresses.length === 0) && (
                <div className="space-y-3 pt-2">
                  <Input
                    label="Street Address"
                    value={customAddress.street}
                    onChange={(e) =>
                      setCustomAddress({ ...customAddress, street: e.target.value })
                    }
                    placeholder="e.g. Thamel Marg, Ward 26"
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="City"
                      value={customAddress.city}
                      onChange={(e) =>
                        setCustomAddress({ ...customAddress, city: e.target.value })
                      }
                      required
                    />

                    <Input
                      label="ZIP Code"
                      value={customAddress.zip}
                      onChange={(e) =>
                        setCustomAddress({ ...customAddress, zip: e.target.value })
                      }
                      placeholder="44600"
                    />
                  </div>
                </div>
              )}

              {/* Delivery Instructions */}
              <div className="pt-2">
                <Input
                  label="Delivery Instructions (Optional)"
                  value={
                    useCustomAddress
                      ? customAddress.instructions
                      : addresses.find((a) => a._id === selectedAddressId)?.instructions || ''
                  }
                  onChange={(e) => {
                    if (useCustomAddress) {
                      setCustomAddress({ ...customAddress, instructions: e.target.value });
                    }
                  }}
                  placeholder="e.g. Ring bell, leave at front desk"
                />
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#f97316] flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Payment Method
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'cash',
                    label: 'Cash on Delivery',
                    desc: 'Pay cash upon food arrival',
                    icon: Banknote,
                  },
                  {
                    id: 'card',
                    label: 'Credit / Debit Card',
                    desc: 'Visa, Mastercard',
                    icon: CreditCard,
                  },
                  {
                    id: 'online',
                    label: 'Online Wallet / QR',
                    desc: 'eSewa, Khalti, Fonepay',
                    icon: Smartphone,
                  },
                ].map((pm) => {
                  const IconComp = pm.icon;
                  const isSelected = paymentMethod === pm.id;

                  return (
                    <div
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-4 rounded-xl border-1.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#f97316] bg-[#fff7ed]/40 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <IconComp
                          className={`w-5 h-5 ${
                            isSelected ? 'text-[#f97316]' : 'text-slate-500'
                          }`}
                        />
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#f97316]" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900">
                        {pm.label}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {pm.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Review Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 sticky top-20">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>Order Summary</span>
                {restaurant && (
                  <span className="text-xs font-normal text-slate-500 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-[#f97316]" />
                    {restaurant.name}
                  </span>
                )}
              </h2>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {cart.map((item) => (
                  <div
                    key={item._id || item.id || item.menuItem}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <VegIndicator isVeg={item.isVegetarian} size={11} />
                      <span className="font-semibold text-slate-900 truncate">
                        {item.name}
                      </span>
                      <span className="text-slate-400">×{item.quantity}</span>
                    </div>
                    <span className="font-bold text-slate-800 tabular-nums">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    ₹{subtotal}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
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

                <div className="flex justify-between text-sm font-bold text-slate-900 pt-3 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="text-[#f97316] text-lg tabular-nums">
                    ₹{total}
                  </span>
                </div>
              </div>

              {/* Submit Order Action */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handlePlaceOrder}
                loading={orderLoading}
                className="shadow-lg hover:shadow-orange-500/20 py-3.5"
              >
                Place Order · ₹{total}
              </Button>

              <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Secure SSL encrypted payment
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Add Address Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setAddressModalOpen(false)}
          />

          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 z-10 shadow-2xl border border-slate-200 animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Add New Address
            </h3>

            <form onSubmit={handleAddAddressSubmit} className="space-y-4">
              <Select
                label="Address Label"
                value={newAddressForm.label}
                onChange={(e) =>
                  setNewAddressForm({ ...newAddressForm, label: e.target.value })
                }
                options={[
                  { value: 'home', label: 'Home' },
                  { value: 'work', label: 'Work' },
                  { value: 'other', label: 'Other' },
                ]}
              />

              <Input
                label="Street Address"
                value={newAddressForm.street}
                onChange={(e) =>
                  setNewAddressForm({ ...newAddressForm, street: e.target.value })
                }
                placeholder="e.g. Lazimpat Marg, Ward 2"
                error={addressErrors.street}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City"
                  value={newAddressForm.city}
                  onChange={(e) =>
                    setNewAddressForm({ ...newAddressForm, city: e.target.value })
                  }
                  error={addressErrors.city}
                  required
                />

                <Input
                  label="ZIP Code"
                  value={newAddressForm.zip}
                  onChange={(e) =>
                    setNewAddressForm({ ...newAddressForm, zip: e.target.value })
                  }
                  placeholder="44600"
                />
              </div>

              <Input
                label="Delivery Instructions"
                value={newAddressForm.instructions}
                onChange={(e) =>
                  setNewAddressForm({
                    ...newAddressForm,
                    instructions: e.target.value,
                  })
                }
                placeholder="e.g. Ring the bell on 2nd floor"
              />

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAddressModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save & Select Address
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Checkout;

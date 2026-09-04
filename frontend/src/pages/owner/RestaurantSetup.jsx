import React, { useState } from 'react';
import { Store, MapPin, Phone, Clock, DollarSign, AlertCircle, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import useRestaurantStore from '../../store/useRestaurantStore';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

const CUISINE_OPTIONS = [
  { value: 'nepali', label: 'Nepali' },
  { value: 'indian', label: 'Indian' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'italian', label: 'Italian' },
  { value: 'bakery', label: 'Bakery & Sweets' },
  { value: 'fast food', label: 'Fast Food' },
  { value: 'japanese', label: 'Japanese / Sushi' },
  { value: 'asian', label: 'Asian Fusion' },
];

export const RestaurantSetup = ({ onCreated }) => {
  const { createRestaurant, loading } = useRestaurantStore();
  const { fetchMe } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: 'nepali',
    street: '',
    city: 'Kathmandu',
    landmark: '',
    phone: '',
    deliveryTime: 30,
    minimumOrder: 10,
    deliveryFee: 2.5,
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Restaurant name is required');
      return;
    }
    if (!formData.street.trim() || !formData.city.trim()) {
      setError('Street and City address are required');
      return;
    }

    setError('');

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        cuisine: [formData.cuisine],
        address: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          landmark: formData.landmark.trim(),
        },
        phone: formData.phone.trim(),
        deliveryTime: parseInt(formData.deliveryTime, 10) || 30,
        minimumOrder: parseFloat(formData.minimumOrder) || 0,
        deliveryFee: parseFloat(formData.deliveryFee) || 0,
      };

      await createRestaurant(payload);
      await fetchMe(); // Refresh user profile to get populated user.restaurant
      if (onCreated) onCreated();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create restaurant profile';
      setError(msg);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 font-sans">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
        <div className="text-center max-w-md mx-auto mb-8">
          <div className="w-14 h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-[#f97316] mx-auto mb-4">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Set Up Your Restaurant</h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome partner! Enter your restaurant details to start accepting orders on KhanaExpress.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#f97316]">
              1. Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Restaurant Name"
                name="name"
                placeholder="e.g. Himalayan Flavor Bistro"
                value={formData.name}
                onChange={handleChange}
                leftIcon={<Store className="w-4 h-4 text-slate-400" />}
                required
              />

              <Select
                label="Cuisine Category"
                name="cuisine"
                options={CUISINE_OPTIONS}
                value={formData.cuisine}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Short Description
              </label>
              <textarea
                name="description"
                rows={2}
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell customers about your signature dishes, history, or specialities..."
                className="w-full text-xs text-slate-800 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none resize-none"
              />
            </div>
          </div>

          {/* Location & Contact */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#f97316]">
              2. Location & Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Street Address"
                name="street"
                placeholder="e.g. New Road #4"
                value={formData.street}
                onChange={handleChange}
                leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
                required
              />

              <Input
                label="City"
                name="city"
                placeholder="e.g. Kathmandu"
                value={formData.city}
                onChange={handleChange}
                required
              />

              <Input
                label="Landmark (Optional)"
                name="landmark"
                placeholder="e.g. Opposite Bishal Bazaar"
                value={formData.landmark}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Contact Phone"
              name="phone"
              placeholder="e.g. 9801234567"
              value={formData.phone}
              onChange={handleChange}
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
            />
          </div>

          {/* Delivery Configuration */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#f97316]">
              3. Delivery & Pricing Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Est. Delivery Time (Mins)"
                name="deliveryTime"
                type="number"
                placeholder="30"
                value={formData.deliveryTime}
                onChange={handleChange}
                leftIcon={<Clock className="w-4 h-4 text-slate-400" />}
              />

              <Input
                label="Minimum Order (NPR)"
                name="minimumOrder"
                type="number"
                step="0.01"
                placeholder="200"
                value={formData.minimumOrder}
                onChange={handleChange}
                leftIcon={<span className="text-xs font-bold text-slate-400">Rs.</span>}
              />

              <Input
                label="Delivery Fee (NPR)"
                name="deliveryFee"
                type="number"
                step="0.01"
                placeholder="50"
                value={formData.deliveryFee}
                onChange={handleChange}
                leftIcon={<span className="text-xs font-bold text-slate-400">Rs.</span>}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              variant="primary"
              size="md"
              type="submit"
              loading={loading}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Create & Launch Restaurant
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestaurantSetup;

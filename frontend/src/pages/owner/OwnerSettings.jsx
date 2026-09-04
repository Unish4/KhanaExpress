import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import useRestaurantStore from '../../store/useRestaurantStore';
import restaurantService from '../../services/restaurant.service';
import toast from 'react-hot-toast';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  DollarSign,
  Upload,
  Power,
  Save,
  AlertCircle
} from 'lucide-react';

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

export const OwnerSettings = ({ restaurant, onUpdated }) => {
  const { updateRestaurant, toggleOpen, loading } = useRestaurantStore();

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

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        description: restaurant.description || '',
        cuisine: restaurant.cuisine || 'nepali',
        street: restaurant.address?.street || '',
        city: restaurant.address?.city || 'Kathmandu',
        landmark: restaurant.address?.landmark || '',
        phone: restaurant.phone || '',
        deliveryTime: restaurant.deliveryTime || 30,
        minimumOrder: restaurant.minimumOrder || 10,
        deliveryFee: restaurant.deliveryFee || 2.5,
      });
      setImagePreview(restaurant.image?.url || restaurant.image || '');
    }
  }, [restaurant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    setUploadingImage(true);
    try {
      await restaurantService.uploadImage(restaurant._id, file);
      toast.success('Restaurant cover image uploaded!');
      if (onUpdated) onUpdated();
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Restaurant name is required');
      return;
    }

    setError('');

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        cuisine: formData.cuisine,
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

      await updateRestaurant(restaurant._id, payload);
      if (onUpdated) onUpdated();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update restaurant settings';
      setError(msg);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Restaurant Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Update store information, operating hours, delivery fees, and cover media
          </p>
        </div>

        <button
          onClick={() => toggleOpen(restaurant._id)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
            restaurant.isOpen
              ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{restaurant.isOpen ? 'Store Open (Click to Close)' : 'Store Closed (Click to Open)'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Cover Image Upload Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#f97316] mb-3">
          Restaurant Cover Banner
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img
            src={
              imagePreview ||
              'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80'
            }
            alt={restaurant.name}
            className="w-full sm:w-48 h-32 rounded-2xl object-cover border border-slate-200 shrink-0"
          />

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <h3 className="text-sm font-bold text-slate-900">Upload New Store Banner</h3>
            <p className="text-xs text-slate-500">
              High quality images increase customer orders. Recommended aspect ratio 16:9, max 5MB.
            </p>

            <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors mt-2">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>{uploadingImage ? 'Uploading...' : 'Choose Banner Image'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        {/* Profile Info */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#f97316]">
            General Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Restaurant Name"
              name="name"
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
              Store Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell customers about your kitchen..."
              className="w-full text-xs text-slate-800 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none resize-none"
            />
          </div>
        </div>

        {/* Address & Contact */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#f97316]">
            Address & Phone
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Street Address"
              name="street"
              value={formData.street}
              onChange={handleChange}
              leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />

            <Input
              label="Landmark"
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Store Contact Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Delivery Rules */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#f97316]">
            Delivery Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Est. Delivery Time (Mins)"
              name="deliveryTime"
              type="number"
              value={formData.deliveryTime}
              onChange={handleChange}
              leftIcon={<Clock className="w-4 h-4 text-slate-400" />}
            />

            <Input
              label="Minimum Order ($)"
              name="minimumOrder"
              type="number"
              step="0.01"
              value={formData.minimumOrder}
              onChange={handleChange}
              leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
            />

            <Input
              label="Delivery Fee ($)"
              name="deliveryFee"
              type="number"
              step="0.01"
              value={formData.deliveryFee}
              onChange={handleChange}
              leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button
            variant="primary"
            size="md"
            type="submit"
            loading={loading}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Restaurant Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OwnerSettings;

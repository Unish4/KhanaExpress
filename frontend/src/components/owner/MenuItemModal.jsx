import React, { useState, useEffect } from 'react';
import { X, Upload, Utensils, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import menuService from '../../services/menu.service';
import toast from 'react-hot-toast';

const CATEGORY_OPTIONS = [
  { value: 'Appetizers', label: 'Appetizers' },
  { value: 'Main Course', label: 'Main Course' },
  { value: 'Momos & Noodles', label: 'Momos & Noodles' },
  { value: 'Burgers & Sandwiches', label: 'Burgers & Sandwiches' },
  { value: 'Pizza & Pasta', label: 'Pizza & Pasta' },
  { value: 'Desserts & Bakery', label: 'Desserts & Bakery' },
  { value: 'Beverages', label: 'Beverages' },
  { value: 'Traditional Nepali', label: 'Traditional Nepali' },
  { value: 'Sides & Snacks', label: 'Sides & Snacks' },
];

export const MenuItemModal = ({ isOpen, onClose, item = null, onSaved }) => {
  const isEditing = Boolean(item);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Main Course',
    price: '',
    isVegetarian: false,
    isVegan: false,
    spicyLevel: 0,
    preparationTime: 15,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category: item.category || 'Main Course',
        price: item.price || '',
        isVegetarian: item.isVegetarian || false,
        isVegan: item.isVegan || false,
        spicyLevel: item.spicyLevel || 0,
        preparationTime: item.preparationTime || 15,
      });
      setImagePreview(item.image?.url || item.image || '');
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'Main Course',
        price: '',
        isVegetarian: false,
        isVegan: false,
        spicyLevel: 0,
        preparationTime: 15,
      });
      setImageFile(null);
      setImagePreview('');
    }
    setError('');
  }, [item, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
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
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Item name is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        isVegetarian: formData.isVegetarian,
        isVegan: formData.isVegan,
        spicyLevel: parseInt(formData.spicyLevel, 10),
        preparationTime: parseInt(formData.preparationTime, 10),
      };

      let savedItem;
      if (isEditing) {
        const res = await menuService.updateMenuItem(item._id, payload);
        savedItem = res.data;
        toast.success(res.message || 'Menu item updated');
      } else {
        const res = await menuService.createMenuItem(payload);
        savedItem = res.data;
        toast.success(res.message || 'Menu item created');
      }

      // If image file selected, upload image
      if (imageFile && savedItem?._id) {
        try {
          await menuService.uploadImage(savedItem._id, imageFile);
          toast.success('Image uploaded successfully');
        } catch (imgErr) {
          toast.error('Item saved, but image upload failed');
        }
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save menu item';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => !loading && onClose()}
      />

      {/* Modal Card */}
      <div
        className="relative bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 z-10 shadow-2xl border border-slate-100 animate-fadeIn font-sans"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={() => !loading && onClose()}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center text-[#f97316]">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <p className="text-xs text-slate-500">
              Fill out dish details for your restaurant menu
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Dish Name"
              name="name"
              placeholder="e.g. Chicken Steam Momo"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Select
              label="Category"
              name="category"
              options={CATEGORY_OPTIONS}
              value={formData.category}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Price ($)"
              name="price"
              type="number"
              step="0.01"
              placeholder="e.g. 8.50"
              value={formData.price}
              onChange={handleChange}
              required
            />

            <Input
              label="Prep Time (Minutes)"
              name="preparationTime"
              type="number"
              placeholder="15"
              value={formData.preparationTime}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief summary of ingredients, taste, and serving size..."
              className="w-full text-xs text-slate-800 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none resize-none"
            />
          </div>

          {/* Spicy & Dietary Toggles */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold text-slate-900">Dietary & Spice Info</h3>
            
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isVegetarian"
                  checked={formData.isVegetarian}
                  onChange={handleChange}
                  className="w-4 h-4 accent-[#f97316] rounded"
                />
                <span className="font-medium">Vegetarian</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isVegan"
                  checked={formData.isVegan}
                  onChange={handleChange}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                <span className="font-medium">Vegan</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Spice Level ({formData.spicyLevel}/3)
              </label>
              <select
                name="spicyLevel"
                value={formData.spicyLevel}
                onChange={handleChange}
                className="w-full text-xs bg-white p-2 border border-slate-200 rounded-lg outline-none"
              >
                <option value={0}>0 - Mild / No Spice</option>
                <option value={1}>1 - Slightly Spicy 🌶️</option>
                <option value={2}>2 - Medium Spicy 🌶️🌶️</option>
                <option value={3}>3 - Extra Hot 🌶️🌶️🌶️</option>
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Dish Image
            </label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
              )}
              <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#f97316] hover:bg-orange-50/30 transition-colors">
                <Upload className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-600 font-medium">
                  {imageFile ? imageFile.name : 'Choose dish image file'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={onClose} disabled={loading} type="button">
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={loading} type="submit">
              {isEditing ? 'Save Changes' : 'Create Item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemModal;

import React, { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import VegIndicator from '../../components/common/VegIndicator';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import MenuItemModal from '../../components/owner/MenuItemModal';
import menuService from '../../services/menu.service';
import useRestaurantStore from '../../store/useRestaurantStore';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Flame,
  Utensils,
  Clock
} from 'lucide-react';

export const OwnerMenu = ({ restaurant }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const restaurantId = restaurant?._id;

  const loadMenu = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res = await menuService.getRestaurantMenu(restaurantId);
      setMenuItems(res.data || []);
    } catch (err) {
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, [restaurantId]);

  const handleToggleAvailability = async (item) => {
    try {
      const res = await menuService.toggleAvailability(item._id);
      toast.success(res.message || 'Availability updated');
      setMenuItems((prev) =>
        prev.map((m) => (m._id === item._id ? { ...m, available: !m.available } : m))
      );
    } catch (err) {
      toast.error('Failed to toggle availability');
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      await menuService.deleteMenuItem(deletingItem._id);
      toast.success('Menu item deleted');
      setDeletingItem(null);
      loadMenu();
    } catch (err) {
      toast.error('Failed to delete menu item');
    } finally {
      setDeleteLoading(false);
    }
  };

  const categories = ['All', ...new Set(menuItems.map((item) => item.category))];

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Menu Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add dishes, set prices, update descriptions, and toggle item availability
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Dish
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#f97316] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search menu items by dish name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all"
          />
        </div>
      </div>

      {/* Menu Items Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonLoader variant="card" height="200px" count={6} />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <EmptyState
            title="No Menu Items Found"
            message="No dishes match your active filter. Click 'Add New Dish' to expand your restaurant menu."
            actionText="Add New Dish"
            onAction={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const itemImage =
              item.image?.url ||
              item.image ||
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80';

            return (
              <div
                key={item._id}
                className={`bg-white rounded-2xl border transition-all p-4 shadow-xs flex flex-col justify-between ${
                  item.available ? 'border-slate-200/80 hover:border-slate-300' : 'border-slate-200 bg-slate-50/70 opacity-80'
                }`}
              >
                <div>
                  {/* Dish Image & Badges */}
                  <div className="relative mb-3">
                    <img
                      src={itemImage}
                      alt={item.name}
                      className="w-full h-36 rounded-xl object-cover border border-slate-100"
                    />

                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <VegIndicator isVeg={item.isVegetarian} />
                      <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    </div>

                    {!item.available && (
                      <span className="absolute bottom-2 right-2 bg-rose-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Title & Price */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.name}</h3>
                    <span className="text-sm font-extrabold text-[#f97316]">
                      ${item.price?.toFixed(2)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[2.25rem]">
                    {item.description || 'No description provided.'}
                  </p>

                  {/* Prep time & Spice level */}
                  <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{item.preparationTime || 15} mins</span>
                    </span>
                    {item.spicyLevel > 0 && (
                      <span className="flex items-center gap-0.5 text-amber-600 font-medium">
                        <Flame className="w-3 h-3 fill-amber-500" />
                        <span>Level {item.spicyLevel}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                      item.available
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {item.available ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{item.available ? 'In Stock' : 'Hidden'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-slate-600 hover:text-[#f97316] rounded-lg hover:bg-slate-100 transition-colors"
                      title="Edit Dish"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingItem(item)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Dish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit MenuItem Modal */}
      <MenuItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={editingItem}
        onSaved={loadMenu}
      />

      {/* Delete Item Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        title="Delete Menu Item?"
        message={`Are you sure you want to remove '${deletingItem?.name}' from your restaurant menu?`}
        confirmText="Delete Dish"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDeleteItem}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
};

export default OwnerMenu;

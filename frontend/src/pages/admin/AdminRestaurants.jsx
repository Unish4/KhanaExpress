import React, { useEffect, useState } from 'react';
import adminService from '../../services/admin.service';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import {
  Store,
  Search,
  CheckCircle,
  XCircle,
  Star,
  Phone,
  MapPin,
  Clock,
  User
} from 'lucide-react';

export const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const res = await adminService.getRestaurants({
        search: searchQuery,
        status: statusFilter,
      });
      setRestaurants(res.data || []);
    } catch (err) {
      toast.error('Failed to load restaurant directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRestaurants();
  };

  const handleToggleStatus = async (id, currentActive, currentFeatured) => {
    setUpdatingId(id);
    try {
      const newActive = !currentActive;
      await adminService.toggleRestaurantStatus(id, { isActive: newActive });
      toast.success(newActive ? 'Restaurant activated & approved!' : 'Restaurant deactivated.');
      fetchRestaurants();
    } catch (err) {
      toast.error('Failed to update restaurant status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleFeatured = async (id, currentFeatured) => {
    setUpdatingId(id);
    try {
      const newFeatured = !currentFeatured;
      await adminService.toggleRestaurantStatus(id, { isFeatured: newFeatured });
      toast.success(newFeatured ? 'Restaurant featured on homepage!' : 'Featured tag removed.');
      fetchRestaurants();
    } catch (err) {
      toast.error('Failed to toggle featured state');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Partner Restaurants Directory</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Approve pending applications, manage active listings, and feature top partner stores
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {['all', 'active', 'inactive'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all ${
                statusFilter === st
                  ? 'bg-[#f97316] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st} Stores
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by restaurant name or cuisine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]"
          />
        </form>
      </div>

      {/* Restaurants List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader variant="card" height="100px" count={4} />
          </div>
        ) : restaurants.length === 0 ? (
          <div className="p-12 text-center">
            <EmptyState
              title="No Restaurants Found"
              message="No partner stores match your search criteria."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3.5 pl-5">Restaurant Name</th>
                  <th className="p-3.5">Owner Contact</th>
                  <th className="p-3.5">Cuisine</th>
                  <th className="p-3.5">Rating & Fee</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {restaurants.map((resto) => {
                  const imageSrc =
                    resto.image?.url ||
                    resto.image ||
                    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80';

                  return (
                    <tr key={resto._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={imageSrc}
                            alt={resto.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                              {resto.name}
                              {resto.isFeatured && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Featured
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {resto.address?.city || 'Kathmandu'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div>
                          <span className="font-semibold text-slate-800 block">
                            {resto.owner?.name || 'Owner'}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {resto.owner?.email || resto.phone}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-1 rounded-lg">
                          {Array.isArray(resto.cuisine) ? resto.cuisine.join(', ') : resto.cuisine}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div>
                          <span className="font-bold text-amber-600 block">
                            ★ {resto.rating?.toFixed(1) || '4.5'}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            Fee: Rs. {resto.deliveryFee || 120}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            resto.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {resto.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{resto.isActive ? 'Active' : 'Inactive'}</span>
                        </span>
                      </td>

                      <td className="p-3.5 pr-5">
                        <div className="flex items-center gap-2">
                          <button
                            disabled={updatingId === resto._id}
                            onClick={() => handleToggleStatus(resto._id, resto.isActive, resto.isFeatured)}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                              resto.isActive
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {resto.isActive ? 'Deactivate' : 'Approve & Activate'}
                          </button>

                          <button
                            disabled={updatingId === resto._id}
                            onClick={() => handleToggleFeatured(resto._id, resto.isFeatured)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              resto.isFeatured
                                ? 'bg-amber-50 text-amber-700 border-amber-300'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                            title="Toggle Featured"
                          >
                            <Star className={`w-3.5 h-3.5 ${resto.isFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRestaurants;

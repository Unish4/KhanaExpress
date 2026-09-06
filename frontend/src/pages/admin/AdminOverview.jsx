import React, { useEffect, useState } from 'react';
import adminService from '../../services/admin.service';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import toast from 'react-hot-toast';
import {
  TrendingUp,
  DollarSign,
  Store,
  Users,
  PackageCheck,
  Percent,
  Award,
  RefreshCw,
  ShoppingBag,
  Bike,
  ShieldAlert
} from 'lucide-react';

export const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await adminService.getStats();
      setStats(res.data || null);
    } catch (err) {
      toast.error('Failed to load platform overview statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 font-sans">
        <SkeletonLoader variant="card" height="120px" count={4} />
        <SkeletonLoader variant="card" height="300px" count={2} />
      </div>
    );
  }

  const {
    totalRevenue = 0,
    estimatedCommission = 0,
    totalDelivered = 0,
    avgOrderValue = 0,
    totalOrders = 0,
    totalRestaurants = 0,
    activeRestaurants = 0,
    userCounts = { customer: 0, restaurant: 0, delivery: 0, admin: 0, total: 0 },
    ordersByStatus = {},
    topRestaurants = [],
  } = stats || {};

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Refresh */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Platform Analytics & Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time financial metrics, user growth, order volumes, and top restaurant performance
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Financial & Operating Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total GMV Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total GMV Revenue</span>
            <span className="text-xl font-black text-emerald-600">
              Rs. {totalRevenue.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Avg: Rs. {avgOrderValue.toFixed(2)} / order</span>
          </div>
        </div>

        {/* Platform Commission */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#f97316] shrink-0">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Est. Commission (10%)</span>
            <span className="text-xl font-black text-slate-900">
              Rs. {estimatedCommission.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Net platform earnings</span>
          </div>
        </div>

        {/* Active Restaurants */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active Partner Stores</span>
            <span className="text-xl font-black text-slate-900">
              {activeRestaurants} <span className="text-xs font-normal text-slate-400">/ {totalRestaurants}</span>
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Stores accepting orders</span>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Registered Users</span>
            <span className="text-xl font-black text-slate-900">{userCounts.total}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {userCounts.customer} Customers • {userCounts.delivery} Drivers
            </span>
          </div>
        </div>
      </div>

      {/* User Distribution & Order Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Roles Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#f97316]" />
            <span>User Accounts Breakdown</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-700">Food Customers</span>
              <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {userCounts.customer}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-700">Restaurant Owners</span>
              <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {userCounts.restaurant}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-700">Delivery Riders</span>
              <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {userCounts.delivery}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-700">System Administrators</span>
              <span className="font-bold text-[#f97316] bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                {userCounts.admin}
              </span>
            </div>
          </div>
        </div>

        {/* Top Restaurants Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Top Performing Partner Restaurants</span>
            </h2>
            <span className="text-xs text-slate-500">By Total Revenue</span>
          </div>

          {topRestaurants.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No restaurant revenue data available yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Restaurant</th>
                    <th className="p-3">Completed Orders</th>
                    <th className="p-3">Total Gross Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topRestaurants.map((resto, idx) => (
                    <tr key={resto._id} className="hover:bg-slate-50/80">
                      <td className="p-3 flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 block">{resto.name}</span>
                          <span className="text-[11px] text-slate-400">{resto.cuisine?.join(', ')}</span>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{resto.orderCount} orders</td>
                      <td className="p-3 font-extrabold text-emerald-600">
                        Rs. {resto.revenue?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;

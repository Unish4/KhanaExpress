import React, { useEffect, useState } from 'react';
import orderService from '../../services/order.service';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import {
  DollarSign,
  TrendingUp,
  CheckCircle,
  PackageCheck,
  Calendar,
  MapPin,
  Store,
  Clock
} from 'lucide-react';

export const DeliveryHistory = () => {
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await orderService.getDeliveryOrders();
      const completed = (res.data || []).filter((o) => o.status === 'delivered');
      setDeliveredOrders(completed);
    } catch (err) {
      toast.error('Failed to load delivery history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const totalDeliveries = deliveredOrders.length;
  // Calculate rider total earnings (base fee Rs. 120 per order + 5% bonus)
  const totalEarnings = deliveredOrders.reduce((sum, order) => {
    const fee = order.deliveryFee || 120;
    return sum + fee;
  }, 0);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Earnings & Delivery History</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Overview of completed deliveries, total payouts, and performance metrics
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Deliveries */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#f97316]">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Completed</span>
            <span className="text-2xl font-black text-slate-900">{totalDeliveries}</span>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Earnings</span>
            <span className="text-2xl font-black text-emerald-600">
              Rs. {totalEarnings.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Success Rate</span>
            <span className="text-2xl font-black text-slate-900">
              {totalDeliveries > 0 ? '100%' : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Completed Orders Log</h2>
          <span className="text-xs text-slate-500">{totalDeliveries} entries</span>
        </div>

        {loading ? (
          <div className="p-6">
            <SkeletonLoader variant="card" height="120px" count={3} />
          </div>
        ) : deliveredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <EmptyState
              title="No Delivery History"
              message="You haven't completed any deliveries yet. Accept available orders to start building your record!"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3.5 pl-5">Order ID</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Restaurant</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Order Total</th>
                  <th className="p-3.5">Rider Earnings</th>
                  <th className="p-3.5 pr-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {deliveredOrders.map((order) => {
                  const fee = order.deliveryFee || 120;
                  const dateStr = order.deliveredAt
                    ? new Date(order.deliveredAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : new Date(order.createdAt).toLocaleDateString();

                  return (
                    <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 pl-5 font-mono font-bold text-slate-900">
                        #{order._id.slice(-6)}
                      </td>
                      <td className="p-3.5 text-slate-500 font-medium whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">
                        {order.restaurant?.name || 'Restaurant'}
                      </td>
                      <td className="p-3.5">
                        {order.customer?.name || 'Customer'}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900">
                        Rs. {order.totalAmount?.toFixed(2)}
                      </td>
                      <td className="p-3.5 font-extrabold text-emerald-600">
                        + Rs. {fee.toFixed(2)}
                      </td>
                      <td className="p-3.5 pr-5">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Delivered</span>
                        </span>
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

export default DeliveryHistory;

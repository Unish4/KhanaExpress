import React, { useEffect, useState } from 'react';
import adminService from '../../services/admin.service';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  Clock,
  Store,
  User,
  Bike,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminService.getOrders({ status: statusFilter });
      setOrders(res.data || []);
    } catch (err) {
      toast.error('Failed to load system orders log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const statuses = [
    'all',
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'delivering',
    'delivered',
    'cancelled',
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-bold text-slate-900">System Orders Audit Log</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time order tracking and audit logs across all platform restaurants and delivery partners
        </p>
      </div>

      {/* Status Filter Pills */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-[#f97316] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader variant="card" height="100px" count={4} />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <EmptyState
              title="No System Orders Found"
              message="No orders match the selected status filter."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3.5 pl-5">Order ID & Date</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Restaurant</th>
                  <th className="p-3.5">Delivery Rider</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5 pr-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.map((order) => {
                  const statusColors = {
                    pending: 'bg-amber-50 text-amber-700 border-amber-200',
                    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
                    preparing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    ready: 'bg-purple-50 text-purple-700 border-purple-200',
                    delivering: 'bg-orange-50 text-orange-700 border-orange-200',
                    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
                  }[order.status] || 'bg-slate-100 text-slate-700';

                  return (
                    <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 pl-5">
                        <span className="font-mono font-bold text-slate-900 block">
                          #{order._id.slice(-6)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(order.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800 block">
                          {order.customer?.name || 'Customer'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {order.customer?.phone || 'No phone'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800 block">
                          {order.restaurant?.name || 'Restaurant'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {order.restaurant?.address?.city || 'Kathmandu'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-medium text-slate-700 block">
                          {order.deliveryPartner?.name || 'Unassigned'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="uppercase text-[11px] font-bold text-slate-600">
                          {order.paymentMethod || 'COD'}
                        </span>
                      </td>

                      <td className="p-3.5 font-black text-slate-900">
                        Rs. {order.totalAmount?.toFixed(2)}
                      </td>

                      <td className="p-3.5 pr-5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${statusColors}`}
                        >
                          <span>{order.status}</span>
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

export default AdminOrders;

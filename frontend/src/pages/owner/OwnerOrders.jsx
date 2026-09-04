import React, { useEffect, useState } from 'react';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useOrderStore from '../../store/useOrderStore';
import toast from 'react-hot-toast';
import {
  Search,
  Filter,
  RefreshCw,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Utensils,
  XCircle,
  AlertTriangle,
  ChevronDown,
  DollarSign
} from 'lucide-react';

const STATUS_FILTERS = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready for Pickup' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

export const OwnerOrders = () => {
  const {
    restaurantOrders,
    fetchRestaurantOrders,
    acceptOrder,
    updateOrderStatus,
    cancelOrder,
    loading,
  } = useOrderStore();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Cancellation State
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const loadOrders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    const params = activeTab !== 'all' ? { status: activeTab } : {};
    await fetchRestaurantOrders(params);
    if (isManual) setRefreshing(false);
  };

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const handleCancelConfirm = async () => {
    if (!selectedOrderToCancel) return;
    setCancelLoading(true);
    try {
      await cancelOrder(selectedOrderToCancel._id, cancelReason || 'Cancelled by restaurant');
      setSelectedOrderToCancel(null);
      setCancelReason('');
      loadOrders();
    } catch (err) {
      // Error handled by store
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredOrders = restaurantOrders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const customerName = (typeof order.customer === 'object' ? order.customer?.name : '')?.toLowerCase();
    const orderId = order._id?.toLowerCase();
    return customerName?.includes(query) || orderId?.includes(query);
  });

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Restaurant Incoming Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage incoming orders, update kitchen cooking status, and coordinate driver pickups
          </p>
        </div>

        <button
          onClick={() => loadOrders(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Orders'}</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {STATUS_FILTERS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-[#f97316] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders by customer name or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all"
          />
        </div>
      </div>

      {/* Orders List */}
      {loading && !refreshing ? (
        <div className="space-y-4">
          <SkeletonLoader variant="card" height="150px" count={3} />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <EmptyState
            title="No Orders Found"
            message={`No orders found matching filter '${activeTab}'.`}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const customer = typeof order.customer === 'object' ? order.customer : null;
            const isCancellable = ['pending', 'confirmed'].includes(order.status);

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Card Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
                      #{order._id?.substring(order._id.length - 6).toUpperCase()}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {customer?.name || 'Customer'}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Ordered at {formatTime(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <StatusBadge status={order.status} />
                    <span className="text-sm font-bold text-[#f97316]">
                      NPR {(order.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Card Main Body */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Items Column */}
                  <div className="md:col-span-2 space-y-2">
                    <h4 className="font-semibold text-slate-700">Order Items</h4>
                    <div className="bg-slate-50 rounded-xl p-3 divide-y divide-slate-200/60">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="py-1.5 first:pt-0 last:pb-0 flex items-start justify-between">
                          <div>
                            <span className="font-semibold text-slate-900">
                              {item.quantity}× {item.name}
                            </span>
                            {item.specialInstructions && (
                              <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-0.5">
                                Note: {item.specialInstructions}
                              </p>
                            )}
                          </div>
                          <span className="font-medium text-slate-700">
                            NPR {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Info & Address */}
                  <div className="bg-slate-50 rounded-xl p-3 space-y-2 text-slate-600">
                    <h4 className="font-semibold text-slate-900">Customer Details</h4>
                    {customer?.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a href={`tel:${customer.phone}`} className="hover:underline font-medium text-slate-800">
                          {customer.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 text-[11px] flex justify-between">
                      <span>Payment Method</span>
                      <span className="font-semibold text-slate-800 uppercase">
                        {order.paymentMethod} ({order.paymentStatus})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {order.status === 'pending' && (
                      <span className="text-amber-600 font-medium animate-pulse">
                        ⚠️ Action Required: Accept incoming order to begin cooking
                      </span>
                    )}
                    {order.status === 'confirmed' && (
                      <span className="text-blue-600 font-medium">
                        Order confirmed. Click "Start Preparing" when kitchen begins.
                      </span>
                    )}
                    {order.status === 'preparing' && (
                      <span className="text-amber-600 font-medium">
                        🍳 Meal cooking in kitchen. Click "Mark Ready" when packed.
                      </span>
                    )}
                    {order.status === 'ready' && (
                      <span className="text-purple-600 font-medium">
                        📦 Packed & waiting for delivery partner pickup.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isCancellable && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedOrderToCancel(order)}
                      >
                        Cancel
                      </Button>
                    )}

                    {order.status === 'pending' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => acceptOrder(order._id)}
                      >
                        Accept Order
                      </Button>
                    )}

                    {order.status === 'confirmed' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateOrderStatus(order._id, 'preparing')}
                      >
                        Start Preparing
                      </Button>
                    )}

                    {order.status === 'preparing' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateOrderStatus(order._id, 'ready')}
                      >
                        Mark Ready for Pickup
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Order Confirm Modal */}
      <ConfirmDialog
        isOpen={Boolean(selectedOrderToCancel)}
        title="Cancel Incoming Order?"
        message="Are you sure you want to cancel this order? The customer will be notified."
        confirmText="Cancel Order"
        cancelText="Back"
        variant="danger"
        loading={cancelLoading}
        onConfirm={handleCancelConfirm}
        onCancel={() => setSelectedOrderToCancel(null)}
      />
    </div>
  );
};

export default OwnerOrders;

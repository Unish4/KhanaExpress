import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/order.service';
import Button from '../../components/common/Button';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import {
  MapPin,
  Store,
  Clock,
  Bike,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  Phone,
  DollarSign
} from 'lucide-react';

export const AvailableOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const navigate = useNavigate();

  const fetchAvailableOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getAvailableOrders();
      setOrders(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load available orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableOrders();
    // Poll every 15 seconds for new ready orders
    const timer = setInterval(() => {
      fetchAvailableOrders();
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleAcceptOrder = async (orderId) => {
    setClaimingId(orderId);
    try {
      await orderService.pickupOrder(orderId);
      toast.success('Order accepted! Redirecting to Active Deliveries...');
      fetchAvailableOrders();
      setTimeout(() => {
        navigate('/delivery/active');
      }, 600);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept order');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Refresh */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Available Pickup Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Accept ready-to-deliver orders nearby and start earning
          </p>
        </div>

        <button
          onClick={fetchAvailableOrders}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Orders List / Grid */}
      {loading && orders.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonLoader variant="card" height="220px" count={4} />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <EmptyState
            title="No Orders Available"
            message="There are currently no orders ready for pickup. Keep your status Online and check back shortly!"
            actionText="Refresh Feed"
            onAction={fetchAvailableOrders}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => {
            const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            const deliveryFee = order.deliveryFee || 120; // Default delivery fee in NPR

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-orange-200 p-5 shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Order Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wide">
                      Order #{order._id.slice(-6)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#f97316] bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full">
                      <span>Rs. {deliveryFee}</span>
                      <span className="text-[10px] font-medium text-slate-500">Pay</span>
                    </span>
                  </div>

                  {/* Pickup Restaurant Info */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <Store className="w-4 h-4 text-[#f97316]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-slate-900 truncate">
                        {order.restaurant?.name || 'Restaurant'}
                      </h3>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{order.restaurant?.address?.street || 'Kathmandu, Nepal'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Dropoff Customer Info */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-slate-700">Delivery Address</h3>
                      <p className="text-xs text-slate-900 font-medium truncate mt-0.5">
                        {order.deliveryAddress?.street || 'Customer Location'}, {order.deliveryAddress?.city || 'Kathmandu'}
                      </p>
                    </div>
                  </div>

                  {/* Summary Footer Badges */}
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                    <span className="flex items-center gap-1 font-medium">
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                      <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ready Now</span>
                    </span>
                    <span className="font-semibold text-slate-700 ml-auto">
                      Total: Rs. {order.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Accept Action */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    loading={claimingId === order._id}
                    onClick={() => handleAcceptOrder(order._id)}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Accept & Start Delivery
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvailableOrders;

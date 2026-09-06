import React, { useEffect, useState } from 'react';
import orderService from '../../services/order.service';
import Button from '../../components/common/Button';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import {
  MapPin,
  Store,
  Phone,
  CheckCircle2,
  Navigation,
  DollarSign,
  PackageCheck,
  ShoppingBag,
  AlertCircle,
  Clock,
  User
} from 'lucide-react';

export const ActiveDeliveries = () => {
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveringId, setDeliveringId] = useState(null);
  const [confirmOrder, setConfirmOrder] = useState(null);

  const fetchActiveDeliveries = async () => {
    setLoading(true);
    try {
      const res = await orderService.getDeliveryOrders();
      const delivering = (res.data || []).filter((o) => o.status === 'delivering' || o.status === 'ready');
      setActiveOrders(delivering);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to fetch active deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveDeliveries();
  }, []);

  const handleCompleteDelivery = async () => {
    if (!confirmOrder) return;
    setDeliveringId(confirmOrder._id);
    try {
      await orderService.deliverOrder(confirmOrder._id);
      toast.success('Order delivered successfully! Earnings updated.');
      setConfirmOrder(null);
      fetchActiveDeliveries();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to complete delivery');
    } finally {
      setDeliveringId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Active Deliveries</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Orders currently assigned to you. Complete pickup and dropoff steps carefully.
        </p>
      </div>

      {loading ? (
        <SkeletonLoader variant="card" height="300px" count={2} />
      ) : activeOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <EmptyState
            title="No Active Deliveries"
            message="You don't have any ongoing deliveries right now. Check the 'Available Orders' tab to pick up new food orders."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {activeOrders.map((order) => {
            const isCOD = order.paymentMethod === 'cod';

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-orange-200 shadow-md overflow-hidden animate-fadeIn"
              >
                {/* Status Bar Header */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-5 h-5 animate-pulse" />
                    <div>
                      <span className="text-xs font-semibold opacity-90 block uppercase tracking-wider">
                        In Transit • Delivery in progress
                      </span>
                      <h2 className="text-sm font-bold">Order #{order._id.slice(-6)}</h2>
                    </div>
                  </div>

                  <div className="bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <span>Collect: Rs. {isCOD ? order.totalAmount?.toFixed(2) : '0.00 (Prepaid)'}</span>
                  </div>
                </div>

                <div className="p-5 space-y-6">
                  {/* Step Stepper Visual */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                    {/* Step 1: Restaurant Pickup */}
                    <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                        <span>1. Picked Up from Restaurant</span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-800 ml-7">
                        {order.restaurant?.name || 'Restaurant'}
                      </h3>
                      <p className="text-xs text-slate-500 ml-7 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{order.restaurant?.address?.street || 'Restaurant Address'}</span>
                      </p>
                      {order.restaurant?.phone && (
                        <a
                          href={`tel:${order.restaurant.phone}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#f97316] ml-7 hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call Restaurant ({order.restaurant.phone})</span>
                        </a>
                      )}
                    </div>

                    {/* Step 2: Customer Dropoff */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#f97316]">
                        <span className="w-5 h-5 rounded-full bg-[#f97316] text-white flex items-center justify-center text-[10px]">
                          2
                        </span>
                        <span>2. Deliver to Customer</span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-800 ml-7 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order.customer?.name || 'Customer'}</span>
                      </h3>
                      <p className="text-xs text-slate-600 ml-7 font-medium">
                        {order.deliveryAddress?.street || 'Delivery Address'}, {order.deliveryAddress?.city || 'Kathmandu'}
                      </p>
                      {order.customer?.phone && (
                        <a
                          href={`tel:${order.customer.phone}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 ml-7 hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call Customer ({order.customer.phone})</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Items Summary Checklist */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#f97316]" />
                      <span>Order Items ({order.items?.length || 0})</span>
                    </h4>
                    <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="p-3 text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-orange-100 text-[#f97316] font-bold flex items-center justify-center text-[11px]">
                              {item.quantity}x
                            </span>
                            <span className="font-semibold text-slate-800">
                              {item.menuItem?.name || item.name || 'Dish Item'}
                            </span>
                          </div>
                          <span className="text-slate-500 font-medium">
                            Rs. {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Instructions Banner */}
                  <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                    isCOD
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <div>
                        <span className="font-bold block">
                          {isCOD ? 'Cash On Delivery (COD)' : 'Prepaid Online Order'}
                        </span>
                        <span className="text-[11px] opacity-80">
                          {isCOD
                            ? `Collect exact cash Rs. ${order.totalAmount?.toFixed(2)} from customer`
                            : 'Order is already paid online. Do not collect cash from customer.'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Complete Delivery */}
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    leftIcon={<PackageCheck className="w-5 h-5" />}
                    onClick={() => setConfirmOrder(order)}
                  >
                    Confirm Delivered & Finish
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmOrder)}
        title="Confirm Order Delivery?"
        message={`Are you sure you have handed over Order #${confirmOrder?._id?.slice(-6)} to ${confirmOrder?.customer?.name || 'the customer'}?`}
        confirmText="Yes, Order Delivered"
        cancelText="Cancel"
        variant="primary"
        loading={Boolean(deliveringId)}
        onConfirm={handleCompleteDelivery}
        onCancel={() => setConfirmOrder(null)}
      />
    </div>
  );
};

export default ActiveDeliveries;

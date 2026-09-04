import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SkeletonLoader from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
import ReviewModal from '../components/orders/ReviewModal';
import useOrderStore from '../store/useOrderStore';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Store,
  Bike,
  Utensils,
  Receipt,
  RotateCw,
  AlertTriangle,
  XCircle,
  Star,
  ChevronLeft,
  DollarSign,
  ShieldCheck,
  CreditCard,
  Wallet
} from 'lucide-react';

export const OrderTrack = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentOrder, fetchOrder, cancelOrder, loading } = useOrderStore();

  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Load Order Data
  const loadOrder = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    await fetchOrder(id);
    setInitialLoading(false);
    if (isManualRefresh) setRefreshing(false);
  };

  useEffect(() => {
    loadOrder();

    // Auto-poll every 15 seconds if order is active
    const interval = setInterval(() => {
      if (
        currentOrder &&
        !['delivered', 'cancelled', 'completed'].includes(currentOrder.status)
      ) {
        fetchOrder(id);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [id]);

  const handleCancelOrder = async () => {
    setCancelLoading(true);
    try {
      await cancelOrder(id, cancelReason || 'Cancelled by customer');
      setShowCancelDialog(false);
      loadOrder();
    } catch (err) {
      // Error handled by store toast
    } finally {
      setCancelLoading(false);
    }
  };

  if (initialLoading && !currentOrder) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
          <div className="space-y-6">
            <SkeletonLoader variant="card" height="120px" />
            <SkeletonLoader variant="card" height="160px" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <SkeletonLoader variant="card" height="300px" />
              </div>
              <div>
                <SkeletonLoader variant="card" height="300px" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!currentOrder && !loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <EmptyState
            title="Order Not Found"
            message="We couldn't find the order details you were looking for. It may not exist or you may not have permission to view it."
            actionText="View My Orders"
            onAction={() => navigate('/account')}
          />
        </main>
        <Footer />
      </div>
    );
  }

  const status = currentOrder?.status || 'pending';
  const isCancelled = status === 'cancelled';
  const isDelivered = status === 'delivered' || status === 'completed';
  const isCancellable = ['pending', 'confirmed'].includes(status);

  // Stepper Logic
  const steps = [
    { key: 'pending', label: 'Order Placed', desc: 'Order received by restaurant', icon: Utensils },
    { key: 'confirmed', label: 'Confirmed', desc: 'Restaurant accepted order', icon: Store },
    { key: 'preparing', label: 'Preparing', desc: 'Meal being cooked in kitchen', icon: Clock },
    { key: 'delivering', label: 'Out for Delivery', desc: 'Partner en route to location', icon: Bike },
    { key: 'delivered', label: 'Delivered', desc: 'Enjoy your meal!', icon: CheckCircle2 },
  ];

  const getStepStatus = (stepKey, index) => {
    if (isCancelled) return 'cancelled';

    const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered'];
    const currentIndex = statusOrder.indexOf(status === 'completed' ? 'delivered' : status);
    
    // Map 'ready' to step index 3 ('delivering')
    let mappedCurrentIndex = currentIndex;
    if (status === 'ready') mappedCurrentIndex = 3;

    let stepTargetIndex = index;
    if (stepKey === 'delivering') stepTargetIndex = 3;
    if (stepKey === 'delivered') stepTargetIndex = 4;

    if (mappedCurrentIndex > stepTargetIndex) return 'completed';
    if (mappedCurrentIndex === stepTargetIndex) return 'current';
    return 'upcoming';
  };

  const getProgressPercentage = () => {
    if (isCancelled) return 0;
    switch (status) {
      case 'pending':
        return 10;
      case 'confirmed':
        return 30;
      case 'preparing':
        return 55;
      case 'ready':
        return 75;
      case 'delivering':
        return 85;
      case 'delivered':
      case 'completed':
        return 100;
      default:
        return 0;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const restaurant = typeof currentOrder.restaurant === 'object' ? currentOrder.restaurant : null;
  const deliveryPartner = typeof currentOrder.deliveryPartner === 'object' ? currentOrder.deliveryPartner : null;
  const items = currentOrder.items || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/account"
              className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-[#f97316] hover:border-orange-200 transition-colors shadow-xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  Order #{currentOrder._id?.substring(currentOrder._id.length - 8).toUpperCase()}
                </h1>
                <StatusBadge status={status} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Placed on {formatDateTime(currentOrder.createdAt || currentOrder.orderDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadOrder(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Status'}</span>
            </button>

            {isCancellable && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowCancelDialog(true)}
              >
                Cancel Order
              </Button>
            )}

            {isDelivered && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowReviewModal(true)}
                leftIcon={<Star className="w-4 h-4" />}
              >
                {reviewSubmitted ? 'Write Another Review' : 'Rate Order'}
              </Button>
            )}
          </div>
        </div>

        {/* Cancelled Banner */}
        {isCancelled && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800">
            <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">This order was cancelled</h3>
              <p className="text-xs text-red-600 mt-0.5">
                Reason: {currentOrder.cancelReason || 'Cancelled by customer'}
              </p>
            </div>
          </div>
        )}

        {/* Live Stepper Tracker Banner */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <span className="text-xs font-semibold text-[#f97316] tracking-wider uppercase">
                  {isDelivered ? 'Order Delivered' : 'Live Order Status'}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  {isDelivered
                    ? 'Delivered & Completed!'
                    : status === 'delivering'
                    ? 'Your food is on the way!'
                    : status === 'preparing'
                    ? 'Chef is preparing your meal'
                    : status === 'confirmed'
                    ? 'Order confirmed by restaurant'
                    : 'Waiting for restaurant confirmation'}
                </h2>
              </div>

              {currentOrder.estimatedDelivery && !isDelivered && (
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 text-[#f97316] px-3.5 py-2 rounded-xl text-xs font-medium self-start md:self-auto">
                  <Clock className="w-4 h-4 animate-pulse" />
                  <span>
                    Est. Delivery by{' '}
                    <strong className="font-semibold">
                      {formatDateTime(currentOrder.estimatedDelivery)}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {/* Stepper Process Bar */}
            <div className="pt-6">
              {/* Progress bar line background */}
              <div className="relative">
                <div className="hidden md:block absolute top-5 left-8 right-8 h-1 bg-slate-100 rounded-full z-0">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-[#f97316] rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                  {steps.map((step, idx) => {
                    const stepState = getStepStatus(step.key, idx);
                    const StepIcon = step.icon;

                    return (
                      <div
                        key={step.key}
                        className="flex md:flex-col items-center md:text-center gap-3 md:gap-2"
                      >
                        {/* Step Circle */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
                            stepState === 'completed'
                              ? 'bg-[#f97316] border-[#f97316] text-white shadow-xs'
                              : stepState === 'current'
                              ? 'bg-orange-50 border-[#f97316] text-[#f97316] ring-4 ring-orange-100 animate-pulse'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <StepIcon className="w-5 h-5" />
                        </div>

                        {/* Step Titles */}
                        <div>
                          <p
                            className={`text-xs font-semibold ${
                              stepState === 'completed' || stepState === 'current'
                                ? 'text-slate-900'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-tight hidden md:block">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Items & Payment */}
          <div className="md:col-span-2 space-y-6">
            {/* Items Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-[#f97316]" />
                  <h2 className="text-base font-bold text-slate-900">Order Items</h2>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {items.length} {items.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map((item, idx) => {
                  const menuItemObj = typeof item.menuItem === 'object' ? item.menuItem : null;
                  const itemImg = menuItemObj?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80';

                  return (
                    <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5">
                      <img
                        src={itemImg}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xs font-semibold text-slate-900 truncate">
                            {item.name}
                          </h3>
                          <span className="text-xs font-bold text-slate-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                        {item.specialInstructions && (
                          <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-1.5 inline-block border border-amber-100">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">
                    ${(currentOrder.subtotal || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Govt Tax (13%)</span>
                  <span className="font-medium text-slate-900">
                    ${(currentOrder.tax || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-slate-900">
                    ${(currentOrder.deliveryFee || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-3 border-t border-slate-100">
                  <span>Total Amount</span>
                  <span className="text-[#f97316]">
                    ${(currentOrder.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#f97316] shrink-0">
                  {currentOrder.paymentMethod === 'card' ? (
                    <CreditCard className="w-5 h-5" />
                  ) : currentOrder.paymentMethod === 'online' ? (
                    <Wallet className="w-5 h-5" />
                  ) : (
                    <DollarSign className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">
                    Payment Method
                  </h3>
                  <p className="text-xs text-slate-500 capitalize">
                    {currentOrder.paymentMethod === 'cash'
                      ? 'Cash on Delivery'
                      : currentOrder.paymentMethod === 'card'
                      ? 'Credit / Debit Card'
                      : 'Digital Wallet (eSewa / Khalti)'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                    currentOrder.paymentStatus === 'paid'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  Status: {currentOrder.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Address, Restaurant, Partner */}
          <div className="space-y-6">
            {/* Delivery Address Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3 text-slate-900 font-semibold text-xs">
                <MapPin className="w-4 h-4 text-[#f97316]" />
                <span>Delivery Address</span>
              </div>
              <p className="text-xs font-bold text-slate-900">
                {currentOrder.deliveryAddress?.street || 'Customer Address'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentOrder.deliveryAddress?.city}
                {currentOrder.deliveryAddress?.landmark ? `, Near ${currentOrder.deliveryAddress.landmark}` : ''}
              </p>
              {currentOrder.deliveryAddress?.phone && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentOrder.deliveryAddress.phone}</span>
                </div>
              )}
            </div>

            {/* Restaurant Details Card */}
            {restaurant && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-slate-900 font-semibold text-xs">
                  <Store className="w-4 h-4 text-[#f97316]" />
                  <span>Restaurant</span>
                </div>
                <div className="flex items-start gap-3">
                  {restaurant.image && (
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {restaurant.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {restaurant.address}
                    </p>
                  </div>
                </div>

                {restaurant.phone && (
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Call Restaurant</span>
                  </a>
                )}
              </div>
            )}

            {/* Delivery Partner Card */}
            {deliveryPartner ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-slate-900 font-semibold text-xs">
                  <Bike className="w-4 h-4 text-[#f97316]" />
                  <span>Delivery Partner</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                    {deliveryPartner.name?.charAt(0) || 'D'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {deliveryPartner.name}
                    </h3>
                    <p className="text-[11px] text-emerald-600 font-medium">Assigned & En Route</p>
                  </div>
                </div>

                {deliveryPartner.phone && (
                  <a
                    href={`tel:${deliveryPartner.phone}`}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Driver ({deliveryPartner.phone})</span>
                  </a>
                )}
              </div>
            ) : (
              !isCancelled &&
              !isDelivered && (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 text-center">
                  <Bike className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-medium text-slate-600">Assigning Delivery Partner</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    A driver will be assigned as soon as food preparation completes.
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </main>

      {/* Cancel Order Confirmation Modal */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        title="Cancel This Order?"
        message="Are you sure you want to cancel this order? The restaurant has been notified."
        confirmText="Yes, Cancel Order"
        cancelText="Keep Order"
        variant="danger"
        loading={cancelLoading}
        onConfirm={handleCancelOrder}
        onCancel={() => setShowCancelDialog(false)}
      />

      {/* Review Submission Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        order={currentOrder}
        onReviewSubmitted={() => setReviewSubmitted(true)}
      />

      <Footer />
    </div>
  );
};

export default OrderTrack;

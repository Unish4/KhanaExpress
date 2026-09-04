import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import useRestaurantStore from '../../store/useRestaurantStore';
import useOrderStore from '../../store/useOrderStore';
import {
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  Utensils,
  Power,
  ArrowRight,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const OwnerDashboard = ({ restaurant }) => {
  const { stats, fetchStats, toggleOpen } = useRestaurantStore();
  const { restaurantOrders, fetchRestaurantOrders, acceptOrder, updateOrderStatus, loading: orderLoading } = useOrderStore();

  useEffect(() => {
    if (restaurant?._id) {
      fetchStats(restaurant._id);
      fetchRestaurantOrders();
    }
  }, [restaurant?._id]);

  const handleToggleOpen = async () => {
    if (restaurant?._id) {
      await toggleOpen(restaurant._id);
    }
  };

  const activeOrders = restaurantOrders.filter(
    (o) => !['delivered', 'cancelled', 'completed'].includes(o.status)
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner / Store Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={
                restaurant.image?.url ||
                restaurant.image ||
                'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80'
              }
              alt={restaurant.name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                restaurant.isOpen ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{restaurant.name}</h1>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  restaurant.isOpen
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {restaurant.isOpen ? 'OPEN FOR ORDERS' : 'STORE CLOSED'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 capitalize">
              {restaurant.cuisine} • {restaurant.address?.street}, {restaurant.address?.city}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleOpen}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs shrink-0 ${
            restaurant.isOpen
              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{restaurant.isOpen ? 'Close Restaurant' : 'Open Restaurant'}</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Revenue</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              NPR {(stats?.revenue?.total || 0).toFixed(2)}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Avg NPR {(stats?.revenue?.averagePerOrder || 0).toFixed(2)} / order</span>
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 2: Total Orders */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Orders</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {stats?.orders?.total || restaurantOrders.length}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Lifetime platform orders</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 3: Completed Orders */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Completed Orders</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {stats?.orders?.completed || 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Successfully delivered</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 4: Menu Items */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Menu Items</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {stats?.menu?.totalItems || 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats?.menu?.availableItems || 0} currently available
            </p>
          </div>
          <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-[#f97316]">
            <Utensils className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Active Incoming Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#f97316]" />
            <h2 className="text-base font-bold text-slate-900">Active Incoming Orders</h2>
            <span className="bg-orange-100 text-[#f97316] text-xs font-bold px-2.5 py-0.5 rounded-full">
              {activeOrders.length}
            </span>
          </div>

          <Link
            to="/owner/orders"
            className="text-xs font-semibold text-[#f97316] hover:text-orange-600 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {activeOrders.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-medium">No active pending orders right now.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              New customer orders will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.slice(0, 5).map((order) => (
              <div
                key={order._id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 shadow-2xs">
                    #{order._id?.substring(order._id.length - 4).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900">
                        {typeof order.customer === 'object' ? order.customer?.name : 'Customer'}
                      </h3>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {order.items?.length || 0} items • Total: NPR {(order.total || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
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
                      variant="secondary"
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
                  {order.status === 'ready' && (
                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
                      Waiting for Driver Pickup
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;

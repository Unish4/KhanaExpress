import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import OwnerDashboard from './OwnerDashboard';
import OwnerOrders from './OwnerOrders';
import OwnerMenu from './OwnerMenu';
import OwnerSettings from './OwnerSettings';
import RestaurantSetup from './RestaurantSetup';
import useAuthStore from '../../store/useAuthStore';
import useRestaurantStore from '../../store/useRestaurantStore';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Settings,
  Store,
  Power,
  RefreshCw
} from 'lucide-react';

export const OwnerLayout = () => {
  const { user } = useAuthStore();
  const { currentRestaurant, fetchRestaurant, loading } = useRestaurantStore();
  const [initialLoading, setInitialLoading] = useState(true);
  const location = useLocation();

  const restaurantId =
    typeof user?.restaurant === 'object'
      ? user.restaurant?._id
      : user?.restaurant;

  const loadRestaurantDetails = async () => {
    if (restaurantId) {
      await fetchRestaurant(restaurantId);
    }
    setInitialLoading(false);
  };

  useEffect(() => {
    loadRestaurantDetails();
  }, [restaurantId]);

  // If user has no restaurant created yet, show Setup Wizard
  if (!restaurantId && !initialLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Navbar />
        <main className="flex-1 py-8">
          <RestaurantSetup onCreated={loadRestaurantDetails} />
        </main>
        <Footer />
      </div>
    );
  }

  if (initialLoading || (loading && !currentRestaurant)) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Navbar />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          <div className="space-y-6">
            <SkeletonLoader variant="card" height="100px" />
            <SkeletonLoader variant="card" height="300px" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const navItems = [
    { path: '/owner', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/owner/orders', label: 'Incoming Orders', icon: ShoppingBag },
    { path: '/owner/menu', label: 'Menu Management', icon: UtensilsCrossed },
    { path: '/owner/settings', label: 'Store Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      <Navbar />

      {/* Sub Header Navigation Bar for Owner Portal */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto scrollbar-none">
          <div className="flex items-center space-x-1 sm:space-x-2 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.exact
                  ? location.pathname === '/owner' || location.pathname === '/owner/dashboard'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-orange-50 text-[#f97316] border border-orange-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs">
            <span className="text-slate-400">Owner Portal</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="font-semibold text-slate-700 truncate max-w-[150px]">
              {currentRestaurant?.name}
            </span>
          </div>
        </div>
      </div>

      {/* Portal Views Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <Routes>
          <Route
            index
            element={<OwnerDashboard restaurant={currentRestaurant} />}
          />
          <Route
            path="dashboard"
            element={<OwnerDashboard restaurant={currentRestaurant} />}
          />
          <Route path="orders" element={<OwnerOrders />} />
          <Route
            path="menu"
            element={<OwnerMenu restaurant={currentRestaurant} />}
          />
          <Route
            path="settings"
            element={
              <OwnerSettings
                restaurant={currentRestaurant}
                onUpdated={loadRestaurantDetails}
              />
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default OwnerLayout;

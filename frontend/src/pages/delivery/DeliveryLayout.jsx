import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import authService from '../../services/auth.service';
import AvailableOrders from './AvailableOrders';
import ActiveDeliveries from './ActiveDeliveries';
import DeliveryHistory from './DeliveryHistory';
import toast from 'react-hot-toast';
import {
  Bike,
  PackageCheck,
  ShoppingBag,
  TrendingUp,
  Power,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const DeliveryLayout = () => {
  const { user, setUser } = useAuthStore();
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const location = useLocation();

  const handleToggleAvailability = async () => {
    setUpdatingStatus(true);
    const newStatus = !isAvailable;
    try {
      const res = await authService.updateProfile({ isAvailable: newStatus });
      setIsAvailable(newStatus);
      if (setUser && res.data) {
        setUser(res.data);
      }
      toast.success(newStatus ? 'You are now ONLINE & Available for Deliveries!' : 'You are now OFFLINE.');
    } catch (err) {
      toast.error('Failed to update availability status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const navLinks = [
    {
      path: '/delivery',
      label: 'Available Orders',
      icon: <ShoppingBag className="w-4 h-4" />,
      exact: true,
    },
    {
      path: '/delivery/active',
      label: 'Active Deliveries',
      icon: <Bike className="w-4 h-4" />,
    },
    {
      path: '/delivery/history',
      label: 'Earnings & History',
      icon: <TrendingUp className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f97316] text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">KhanaExpress Delivery</span>
                <span className="bg-orange-50 text-[#f97316] border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Rider Portal
                </span>
              </div>
              <p className="text-xs text-slate-500">Welcome back, {user?.name || 'Rider'}</p>
            </div>
          </div>

          {/* Availability Status Switch */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleAvailability}
              disabled={updatingStatus}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border shadow-2xs ${
                isAvailable
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span>{isAvailable ? 'ONLINE • Accepting Orders' : 'OFFLINE'}</span>
              <Power className="w-3.5 h-3.5 ml-1 opacity-70" />
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {navLinks.map((link) => {
              const isActive = link.exact
                ? location.pathname === link.path
                : location.pathname.startsWith(link.path);

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.exact}
                  className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-[#f97316] text-[#f97316] bg-orange-50/40'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main View Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <Routes>
          <Route path="/" element={<AvailableOrders />} />
          <Route path="/active" element={<ActiveDeliveries />} />
          <Route path="/history" element={<DeliveryHistory />} />
          <Route path="*" element={<Navigate to="/delivery" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default DeliveryLayout;

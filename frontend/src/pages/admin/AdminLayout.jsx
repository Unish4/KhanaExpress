import React from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import AdminOverview from './AdminOverview';
import AdminRestaurants from './AdminRestaurants';
import AdminUsers from './AdminUsers';
import AdminOrders from './AdminOrders';
import {
  ShieldCheck,
  TrendingUp,
  Store,
  Users,
  ShoppingBag,
  Activity,
  ArrowUpRight
} from 'lucide-react';

export const AdminLayout = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  const navLinks = [
    {
      path: '/admin',
      label: 'Platform Overview',
      icon: <TrendingUp className="w-4 h-4" />,
      exact: true,
    },
    {
      path: '/admin/restaurants',
      label: 'Partner Restaurants',
      icon: <Store className="w-4 h-4" />,
    },
    {
      path: '/admin/users',
      label: 'User Accounts',
      icon: <Users className="w-4 h-4" />,
    },
    {
      path: '/admin/orders',
      label: 'Order Audit Log',
      icon: <ShoppingBag className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Top Header Bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Logo / Admin Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f97316] text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white">KhanaExpress Admin</span>
                <span className="bg-orange-500/20 text-[#f97316] border border-orange-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">Logged in as {user?.email || 'Admin'}</p>
            </div>
          </div>

          {/* System Status & Exit Link */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 text-xs text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Operational</span>
            </div>

            <NavLink
              to="/"
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors"
            >
              <span>View Main Site</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="bg-slate-950/60 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto scrollbar-none">
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
                      ? 'border-[#f97316] text-[#f97316] bg-slate-900'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
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

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/restaurants" element={<AdminRestaurants />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;

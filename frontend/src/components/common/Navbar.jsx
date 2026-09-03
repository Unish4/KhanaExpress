import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Search, Compass, Store, Bike, Shield, Menu as MenuIcon, X } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useCartStore from '../../store/useCartStore';

export const Navbar = ({ onSearchChange, searchValue = '' }) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getCartCount, openCart } = useCartStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = getCartCount();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  const getRoleDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'restaurant':
        return '/owner';
      case 'delivery':
        return '/delivery';
      case 'admin':
        return '/admin';
      default:
        return '/account';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-[#f97316] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            Khana<span className="text-[#f97316]">Express</span>
          </span>
        </Link>

        {/* Search Bar for Customer Browse View */}
        {location.pathname === '/' || location.pathname === '/restaurants' ? (
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search restaurants, cuisines or dishes..."
                value={searchValue}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="w-full text-sm pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#f97316] focus:bg-white focus:ring-2 focus:ring-[#f97316]/15 transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>
        ) : null}

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/restaurants"
            className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/restaurants'
                ? 'text-[#f97316] bg-orange-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Explore
          </Link>

          {/* Cart Button */}
          {user?.role !== 'restaurant' && user?.role !== 'delivery' && user?.role !== 'admin' && (
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-lg text-slate-700 hover:bg-orange-50 hover:text-[#f97316] transition-colors"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#f97316] text-white text-[11px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* User Auth Controls */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full border border-slate-200 hover:border-orange-300 bg-white transition-all outline-none"
              >
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-semibold text-slate-900 truncate max-w-[100px]">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500 capitalize leading-none mt-0.5">
                    {user.role}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-[#f97316] font-bold text-xs overflow-hidden flex-shrink-0">
                  {user.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      to={getRoleDashboardLink()}
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-[#f97316] transition-colors"
                    >
                      {user.role === 'restaurant' && <Store className="w-4 h-4" />}
                      {user.role === 'delivery' && <Bike className="w-4 h-4" />}
                      {user.role === 'admin' && <Shield className="w-4 h-4" />}
                      {user.role === 'customer' && <User className="w-4 h-4" />}
                      <span>
                        {user.role === 'customer' ? 'My Account' : 'Dashboard'}
                      </span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-700 hover:text-[#f97316] px-3 py-2 rounded-lg transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="text-xs font-semibold bg-[#f97316] text-white hover:bg-[#ea580c] px-3.5 py-2 rounded-lg shadow-xs transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden items-center gap-2">
          {user?.role !== 'restaurant' && user?.role !== 'delivery' && user?.role !== 'admin' && (
            <button
              onClick={openCart}
              className="relative p-2 text-slate-700 hover:text-[#f97316]"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#f97316] text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-3 animate-fadeIn">
          <Link
            to="/restaurants"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 hover:text-[#f97316]"
          >
            Explore Restaurants
          </Link>

          {isAuthenticated && user ? (
            <>
              <Link
                to={getRoleDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-700 hover:text-[#f97316]"
              >
                {user.role === 'customer' ? 'My Account' : 'Dashboard'}
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left text-sm font-medium text-red-600"
              >
                Log Out
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center text-xs font-semibold py-2 rounded-lg border border-slate-200 text-slate-700"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center text-xs font-semibold py-2 rounded-lg bg-[#f97316] text-white"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

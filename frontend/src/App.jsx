import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';

// Real Pages (Phase 2)
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';

// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute';

// Temporary Screen Placeholder for future phases
const PlaceholderScreen = ({ title, role }) => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-slate-50">
    <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#f97316] font-bold text-xl mb-4 shadow-xs">
      {title.charAt(0)}
    </div>
    <h1 className="text-xl font-bold text-slate-900 mb-2">{title}</h1>
    <p className="text-xs text-slate-500 max-w-sm mb-4">
      {role ? `Configured for ${role} role.` : 'Screen layout stub.'}
    </p>
    <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
      Route: {window.location.pathname}
    </span>
  </div>
);

function App() {
  const { fetchMe, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [token, fetchMe]);

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer / Discovery Routes */}
      <Route path="/" element={<PlaceholderScreen title="Landing Page" />} />
      <Route path="/restaurants" element={<PlaceholderScreen title="Restaurant Directory" />} />
      <Route path="/restaurants/:id" element={<PlaceholderScreen title="Restaurant Detail & Menu" />} />
      <Route path="/checkout" element={<PlaceholderScreen title="Checkout Page" />} />
      <Route path="/orders/:id/track" element={<PlaceholderScreen title="Order Live Tracking" />} />

      {/* Authenticated User Account */}
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />

      {/* Role Protected Dashboards */}
      <Route
        path="/owner/*"
        element={
          <ProtectedRoute allowedRoles={['restaurant', 'admin']}>
            <PlaceholderScreen title="Restaurant Owner Portal" role="Restaurant Owner" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/delivery/*"
        element={
          <ProtectedRoute allowedRoles={['delivery', 'admin']}>
            <PlaceholderScreen title="Delivery Partner Portal" role="Delivery Partner" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PlaceholderScreen title="Admin Control Dashboard" role="Platform Admin" />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';

// Temporary Phase 1 Placeholders
const PlaceholderScreen = ({ title, role }) => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
    <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#f97316] font-bold text-xl mb-4 shadow-xs">
      {title.charAt(0)}
    </div>
    <h1 className="text-xl font-bold text-slate-900 mb-2">{title}</h1>
    <p className="text-xs text-slate-500 max-w-sm mb-4">
      {role ? `Configured for ${role} role.` : 'Phase 1 Foundation Stub initialized.'}
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
      <Route path="/" element={<PlaceholderScreen title="Landing Page" />} />
      <Route path="/login" element={<PlaceholderScreen title="Login Page" />} />
      <Route path="/register" element={<PlaceholderScreen title="Register Page" />} />
      <Route path="/restaurants" element={<PlaceholderScreen title="Restaurant Directory" />} />
      <Route path="/restaurants/:id" element={<PlaceholderScreen title="Restaurant Detail & Menu" />} />
      <Route path="/checkout" element={<PlaceholderScreen title="Checkout Page" />} />
      <Route path="/orders/:id/track" element={<PlaceholderScreen title="Order Live Tracking" />} />
      <Route path="/account" element={<PlaceholderScreen title="User Account & Saved Addresses" />} />

      {/* Role Dashboards */}
      <Route path="/owner/*" element={<PlaceholderScreen title="Restaurant Owner Portal" role="Restaurant Owner" />} />
      <Route path="/delivery/*" element={<PlaceholderScreen title="Delivery Partner Portal" role="Delivery Partner" />} />
      <Route path="/admin/*" element={<PlaceholderScreen title="Admin Control Dashboard" role="Platform Admin" />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

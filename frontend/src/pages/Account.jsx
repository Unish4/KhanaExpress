import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  KeyRound,
  MapPin,
  Clock,
  Camera,
  Trash2,
  Plus,
  Edit2,
  Star,
  LogOut,
  CheckCircle,
  Home,
  Briefcase,
  Globe,
} from 'lucide-react';

import useAuthStore from '../store/useAuthStore';
import useAddressStore from '../store/useAddressStore';
import useOrderStore from '../store/useOrderStore';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SkeletonLoader from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

export const Account = () => {
  const { user, updateProfile, changePassword, uploadAvatar, deleteAvatar, logout, loading } =
    useAuthStore();
  const { addresses, fetchAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress, loading: addressLoading } =
    useAddressStore();
  const { myOrders, fetchMyOrders, loading: orderLoading } = useOrderStore();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // Address Modal state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: 'home',
    street: '',
    city: 'Kathmandu',
    zip: '',
    instructions: '',
    isDefault: false,
  });
  const [addressErrors, setAddressErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
      });
      fetchAddresses();
      if (user.role === 'customer') {
        fetchMyOrders();
      }
    }
  }, [user]);

  // Profile submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return;
    await updateProfile({
      name: profileForm.name.trim(),
      phone: profileForm.phone.trim(),
    });
  };

  // Password submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) errors.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 6) errors.newPassword = 'New password must be at least 6 characters';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (err) {}
  };

  // Avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAvatar(file);
  };

  // Address Modal Handlers
  const handleOpenAddressModal = (addr = null) => {
    if (addr) {
      setEditingAddressId(addr._id);
      setAddressForm({
        label: addr.label || 'home',
        street: addr.street || '',
        city: addr.city || 'Kathmandu',
        zip: addr.zip || '',
        instructions: addr.instructions || '',
        isDefault: addr.isDefault || false,
      });
    } else {
      setEditingAddressId(null);
      setAddressForm({
        label: 'home',
        street: '',
        city: 'Kathmandu',
        zip: '',
        instructions: '',
        isDefault: false,
      });
    }
    setAddressErrors({});
    setAddressModalOpen(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!addressForm.street.trim()) errors.street = 'Street address is required';
    if (!addressForm.city.trim()) errors.city = 'City is required';

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }

    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, addressForm);
      } else {
        await addAddress(addressForm);
      }
      setAddressModalOpen(false);
    } catch (err) {}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const labelIcons = {
    home: Home,
    work: Briefcase,
    other: Globe,
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* User Hero Banner Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              {/* Avatar Box */}
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center text-[#f97316] font-bold text-2xl overflow-hidden shadow-sm">
                  {user?.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>

                {/* Upload Button Overlay */}
                <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#f97316] text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-[#ea580c] transition-transform group-hover:scale-105">
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-1">
                  <h1 className="text-xl font-bold text-slate-900">
                    {user?.name}
                  </h1>
                  <Badge variant="orange" className="capitalize text-[11px]">
                    {user?.role}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mb-2">{user?.email}</p>
                {user?.avatar?.url && (
                  <button
                    onClick={deleteAvatar}
                    className="text-[11px] font-semibold text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove avatar
                  </button>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogoutConfirm(true)}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </Button>
          </div>
        </div>

        {/* Tab Navigation & Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs Sidebar */}
          <div className="space-y-1">
            {[
              { id: 'profile', label: 'Profile Settings', icon: User },
              { id: 'security', label: 'Security & Password', icon: KeyRound },
              { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
              ...(user?.role === 'customer'
                ? [{ id: 'orders', label: 'Order History', icon: Clock }]
                : []),
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#f97316] text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Main Tab Content */}
          <div className="lg:col-span-3">
            {/* Tab 1: Profile Details */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Personal Information
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update your account display name and contact phone number
                  </p>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
                  <Input
                    label="Email Address"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    helperText="Email address cannot be changed."
                  />

                  <Input
                    label="Full Name"
                    type="text"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                    placeholder="Your full name"
                    required
                  />

                  <Input
                    label="Phone Number"
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phone: e.target.value })
                    }
                    placeholder="+977-9800000000"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={loading}
                  >
                    Save Changes
                  </Button>
                </form>
              </div>
            )}

            {/* Tab 2: Change Password */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Change Password
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ensure your account is using a strong password
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    error={passwordErrors.currentPassword}
                    required
                  />

                  <Input
                    label="New Password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    error={passwordErrors.newPassword}
                    helperText="At least 6 characters long."
                    required
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    error={passwordErrors.confirmPassword}
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={loading}
                  >
                    Update Password
                  </Button>
                </form>
              </div>
            )}

            {/* Tab 3: Saved Addresses */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Saved Addresses
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Manage delivery locations for quick checkout
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenAddressModal()}
                    icon={Plus}
                  >
                    Add Address
                  </Button>
                </div>

                {addressLoading ? (
                  <SkeletonLoader type="list" count={3} />
                ) : addresses.length === 0 ? (
                  <EmptyState
                    icon={MapPin}
                    title="No saved addresses"
                    description="Add a delivery address to complete orders faster."
                    actionLabel="Add Address"
                    onAction={() => handleOpenAddressModal()}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => {
                      const IconComp = labelIcons[addr.label] || MapPin;
                      return (
                        <div
                          key={addr._id}
                          className={`p-4 rounded-xl border transition-all ${
                            addr.isDefault
                              ? 'border-[#f97316] bg-[#fff7ed]/30 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#f97316] flex items-center justify-center">
                                <IconComp className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-slate-900 capitalize">
                                {addr.label}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  Default
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenAddressModal(addr)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteAddress(addr._id)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded-md"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs font-semibold text-slate-800">
                            {addr.street}
                          </p>
                          <p className="text-xs text-slate-500">
                            {addr.city} {addr.zip ? `· ${addr.zip}` : ''}
                          </p>
                          {addr.instructions && (
                            <p className="text-[11px] text-slate-400 italic mt-1">
                              "{addr.instructions}"
                            </p>
                          )}

                          {!addr.isDefault && (
                            <button
                              onClick={() => setDefaultAddress(addr._id)}
                              className="mt-3 text-[11px] font-semibold text-[#f97316] hover:underline"
                            >
                              Set as default
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Order History */}
            {activeTab === 'orders' && user?.role === 'customer' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Order History
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    View and track your previous food orders
                  </p>
                </div>

                {orderLoading ? (
                  <SkeletonLoader type="list" count={4} />
                ) : myOrders.length === 0 ? (
                  <EmptyState
                    icon={Clock}
                    title="No past orders"
                    description="You haven't placed any food orders yet."
                    actionLabel="Explore Restaurants"
                    onAction={() => navigate('/restaurants')}
                  />
                ) : (
                  <div className="space-y-4">
                    {myOrders.map((order) => (
                      <div
                        key={order._id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-sm transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
                          <div>
                            <span className="text-xs font-bold text-slate-900">
                              Order #{order._id.slice(-6).toUpperCase()}
                            </span>
                            <p className="text-[11px] text-slate-500">
                              {new Date(order.createdAt).toLocaleDateString()}{' '}
                              at{' '}
                              {new Date(order.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>

                          <StatusBadge status={order.status} />
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {order.restaurant?.name || 'Restaurant'}
                            </p>
                            <p className="text-slate-500">
                              {order.items?.length || 0} items · NPR {order.total}
                            </p>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/orders/${order._id}/track`)}
                          >
                            Track Order
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Address Form Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setAddressModalOpen(false)}
          />

          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 z-10 shadow-2xl border border-slate-200 animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingAddressId ? 'Edit Address' : 'Add New Address'}
            </h3>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <Select
                label="Address Label"
                value={addressForm.label}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, label: e.target.value })
                }
                options={[
                  { value: 'home', label: 'Home' },
                  { value: 'work', label: 'Work' },
                  { value: 'other', label: 'Other' },
                ]}
              />

              <Input
                label="Street Address"
                value={addressForm.street}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, street: e.target.value })
                }
                placeholder="e.g. Lazimpat Marg, Ward 2"
                error={addressErrors.street}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City"
                  value={addressForm.city}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, city: e.target.value })
                  }
                  error={addressErrors.city}
                  required
                />

                <Input
                  label="ZIP Code"
                  value={addressForm.zip}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, zip: e.target.value })
                  }
                  placeholder="44600"
                />
              </div>

              <Input
                label="Delivery Instructions"
                value={addressForm.instructions}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    instructions: e.target.value,
                  })
                }
                placeholder="e.g. Ring the bell on 2nd floor"
              />

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      isDefault: e.target.checked,
                    })
                  }
                  className="rounded border-slate-300 text-[#f97316] focus:ring-[#f97316]"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Set as default delivery address
                </span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAddressModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Address
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Log Out Confirmation"
        message="Are you sure you want to log out of your KhanaExpress account?"
        confirmText="Log Out"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <Footer />
    </div>
  );
};

export default Account;

import React, { useEffect, useState } from 'react';
import adminService from '../../services/admin.service';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Edit2
} from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({
        role: roleFilter,
        search: searchQuery,
      });
      setUsers(res.data || []);
    } catch (err) {
      toast.error('Failed to load user accounts directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleActive = async (user) => {
    setUpdatingId(user._id);
    try {
      const newStatus = !user.isActive;
      await adminService.updateUserStatus(user._id, { isActive: newStatus });
      toast.success(newStatus ? 'User account unblocked!' : 'User account blocked.');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user active status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await adminService.updateUserStatus(userId, { role: newRole });
      toast.success(`User role updated to '${newRole}'`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to change user role');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-bold text-slate-900">User Accounts Directory</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage system users across customer, restaurant owner, delivery partner, and admin roles
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Role Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {['all', 'customer', 'restaurant', 'delivery', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize whitespace-nowrap transition-all ${
                roleFilter === r
                  ? 'bg-[#f97316] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r === 'all' ? 'All Roles' : r}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search user by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]"
          />
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader variant="card" height="100px" count={4} />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <EmptyState
              title="No Users Found"
              message="No user accounts match your search filter."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3.5 pl-5">User</th>
                  <th className="p-3.5">Email & Phone</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5 pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((usr) => {
                  const roleBadgeColor = {
                    customer: 'bg-blue-50 text-blue-700 border-blue-200',
                    restaurant: 'bg-orange-50 text-orange-700 border-orange-200',
                    delivery: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    admin: 'bg-purple-50 text-purple-700 border-purple-200',
                  }[usr.role] || 'bg-slate-100 text-slate-700';

                  return (
                    <tr key={usr._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center border border-slate-200 shrink-0">
                            {usr.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{usr.name}</span>
                            <span className="text-[11px] text-slate-400">
                              Joined {new Date(usr.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div>
                          <span className="font-medium text-slate-800 block flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {usr.email}
                          </span>
                          {usr.phone && (
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {usr.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <select
                          value={usr.role}
                          disabled={updatingId === usr._id}
                          onChange={(e) => handleRoleChange(usr._id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${roleBadgeColor}`}
                        >
                          <option value="customer">customer</option>
                          <option value="restaurant">restaurant</option>
                          <option value="delivery">delivery</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            usr.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {usr.isActive !== false ? (
                            <>
                              <UserCheck className="w-3 h-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3" />
                              <span>Blocked</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="p-3.5 pr-5">
                        <button
                          disabled={updatingId === usr._id}
                          onClick={() => handleToggleActive(usr)}
                          className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                            usr.isActive !== false
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {usr.isActive !== false ? 'Block User' : 'Unblock User'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;

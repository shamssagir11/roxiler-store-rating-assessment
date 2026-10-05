import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Eye, Users } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  SearchBar,
  Button,
  SortableColumn,
  Modal,
  Input,
  Select,
  EmptyState,
  TableSkeleton,
} from '../../components/ui';
import { adminService } from '../../services/adminService';
import { validateUserForm } from '../../utils/validation';
import { useToast } from '../../hooks/useToast';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Add User Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'USER',
  });
  const [userErrors, setUserErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // User Details Modal
  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const toast = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({
        search,
        role: roleFilter,
        sortBy,
        sortOrder,
      });
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error('Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, sortBy, sortOrder, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleViewUser = async (id) => {
    try {
      setDetailLoading(true);
      const res = await adminService.getUserById(id);
      setDetailUser(res.data.user);
    } catch (err) {
      toast.error('Failed to load user details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const validation = validateUserForm(userData, true);
    if (!validation.isValid) {
      setUserErrors(validation.errors);
      return;
    }

    setUserErrors({});
    setSubmitting(true);
    try {
      await adminService.createUser(userData);
      toast.success('User registered successfully!');
      setAddModalOpen(false);
      setUserData({ name: '', email: '', address: '', password: '', role: 'USER' });
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create user.';
      toast.error(msg);
      if (err.response?.data?.errors) {
        setUserErrors(err.response.data.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge badge-admin">Admin</span>;
      case 'STORE_OWNER':
        return <span className="badge badge-owner">Store Owner</span>;
      case 'USER':
      default:
        return <span className="badge badge-user">Normal User</span>;
    }
  };

  return (
    <DashboardLayout title="User Management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Users Directory</h2>
          <p style={{ color: 'var(--color-slate-500)', fontSize: '0.875rem' }}>
            Search, filter, and inspect registered system accounts
          </p>
        </div>
        <Button
          variant="primary"
          icon={<UserPlus size={16} />}
          onClick={() => setAddModalOpen(true)}
        >
          Add New User
        </Button>
      </div>

      <div className="table-container">
        {/* Table Toolbar */}
        <div className="table-toolbar">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, or address..."
          />

          <div className="table-filters">
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-500)', fontWeight: 600 }}>
              Role:
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Administrators</option>
              <option value="STORE_OWNER">Store Owners</option>
              <option value="USER">Normal Users</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users match your criteria"
            description="Try clearing your search query or role filter."
            action={
              (search || roleFilter) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setRoleFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              )
            }
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <SortableColumn
                  label="Name"
                  field="name"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableColumn
                  label="Email"
                  field="email"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableColumn
                  label="Address"
                  field="address"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableColumn
                  label="Role"
                  field="role"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableColumn
                  label="Joined Date"
                  field="createdAt"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>
                      {u.name}
                    </div>
                    {u.store && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: 2 }}>
                        Manages: <strong>{u.store.name}</strong> ({u.store.averageRating} ★)
                      </div>
                    )}
                  </td>
                  <td>{u.email}</td>
                  <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={u.address}>
                    {u.address}
                  </td>
                  <td>{getRoleBadge(u.role)}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Eye size={14} />}
                      onClick={() => handleViewUser(u.id)}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Create New User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={submitting}
              onClick={handleCreateUser}
            >
              Save User
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateUser}>
          <Input
            label="Full Name"
            name="name"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            placeholder="20 to 60 characters"
            error={userErrors.name}
            maxLength={60}
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            placeholder="user@example.com"
            error={userErrors.email}
            required
          />

          <Select
            label="Assigned Role"
            name="role"
            value={userData.role}
            onChange={(e) => setUserData({ ...userData, role: e.target.value })}
            options={[
              { value: 'USER', label: 'Normal User' },
              { value: 'STORE_OWNER', label: 'Store Owner' },
              { value: 'ADMIN', label: 'System Administrator' },
            ]}
            required
          />

          <div className="form-group">
            <label className="form-label">
              <span>Address <span style={{ color: 'var(--color-danger)' }}>*</span></span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-400)' }}>
                {userData.address.length}/400
              </span>
            </label>
            <textarea
              rows={2}
              value={userData.address}
              onChange={(e) => setUserData({ ...userData, address: e.target.value })}
              placeholder="Physical street address (max 400 chars)"
              maxLength={400}
              className={`form-textarea ${userErrors.address ? 'has-error' : ''}`}
            />
            {userErrors.address && <div className="form-error">{userErrors.address}</div>}
          </div>

          <Input
            label="Password"
            name="password"
            type="password"
            value={userData.password}
            onChange={(e) => setUserData({ ...userData, password: e.target.value })}
            placeholder="8-16 characters with 1 uppercase & 1 special"
            error={userErrors.password}
            hint="Must be 8-16 characters, 1 uppercase, 1 special character"
            showPasswordToggle
            required
          />
        </form>
      </Modal>

      {/* User Details Modal */}
      <Modal
        isOpen={Boolean(detailUser)}
        onClose={() => setDetailUser(null)}
        title="User Account Details"
        footer={
          <Button variant="secondary" onClick={() => setDetailUser(null)}>
            Close
          </Button>
        }
      >
        {detailUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)' }}>Role</span>
              {getRoleBadge(detailUser.role)}
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-400)', textTransform: 'uppercase', fontWeight: 600 }}>
                Full Name
              </span>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>
                {detailUser.name}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-400)', textTransform: 'uppercase', fontWeight: 600 }}>
                Email
              </span>
              <div style={{ color: 'var(--color-slate-700)' }}>{detailUser.email}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-400)', textTransform: 'uppercase', fontWeight: 600 }}>
                Address
              </span>
              <div style={{ color: 'var(--color-slate-700)' }}>{detailUser.address}</div>
            </div>

            {/* If store owner, display their store performance summary */}
            {detailUser.store && (
              <div
                style={{
                  marginTop: 8,
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-slate-50)',
                  border: '1px solid var(--color-slate-200)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-slate-900)', marginBottom: 6 }}>
                  Managed Store: {detailUser.store.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)' }}>
                  Average Rating: <strong>{detailUser.store.averageRating} / 5</strong> ({detailUser.store.ratingCount} ratings)
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AdminUsers;

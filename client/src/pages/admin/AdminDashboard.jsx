import React, { useState, useEffect } from 'react';
import { Users, Store, Star, Award, UserPlus, PlusCircle, ShieldCheck } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, Button, LoadingSpinner, Modal, Input, Select } from '../../components/ui';
import { adminService } from '../../services/adminService';
import { validateUserForm, validateStoreForm } from '../../utils/validation';
import { useToast } from '../../hooks/useToast';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add User Modal State
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'USER',
  });
  const [userErrors, setUserErrors] = useState({});
  const [userSubmitting, setUserSubmitting] = useState(false);

  // Add Store Modal State
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [storeData, setStoreData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });
  const [storeErrors, setStoreErrors] = useState({});
  const [storeSubmitting, setStoreSubmitting] = useState(false);
  const [eligibleOwners, setEligibleOwners] = useState([]);

  const toast = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboardStats();
      setStats(res.data);
    } catch (err) {
      toast.error('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const openStoreModal = async () => {
    try {
      const res = await adminService.getEligibleOwners();
      setEligibleOwners(res.data.owners || []);
      setStoreModalOpen(true);
    } catch (err) {
      toast.error('Failed to load available store owners.');
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
    setUserSubmitting(true);
    try {
      await adminService.createUser(userData);
      toast.success('User created successfully!');
      setUserModalOpen(false);
      setUserData({ name: '', email: '', address: '', password: '', role: 'USER' });
      fetchStats();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create user.';
      toast.error(msg);
      if (err.response?.data?.errors) {
        setUserErrors(err.response.data.errors);
      }
    } finally {
      setUserSubmitting(false);
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    const validation = validateStoreForm(storeData);
    if (!validation.isValid) {
      setStoreErrors(validation.errors);
      return;
    }

    setStoreErrors({});
    setStoreSubmitting(true);
    try {
      await adminService.createStore(storeData);
      toast.success('Store created successfully!');
      setStoreModalOpen(false);
      setStoreData({ name: '', email: '', address: '', ownerId: '' });
      fetchStats();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create store.';
      toast.error(msg);
      if (err.response?.data?.errors) {
        setStoreErrors(err.response.data.errors);
      }
    } finally {
      setStoreSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="System Overview">
        <LoadingSpinner text="Loading admin analytics..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="System Administrator Dashboard">
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Platform Summary</h2>
          <p style={{ color: 'var(--color-slate-500)', fontSize: '0.875rem' }}>
            Real-time aggregate data and management controls
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            variant="secondary"
            icon={<UserPlus size={16} />}
            onClick={() => setUserModalOpen(true)}
          >
            Add User
          </Button>
          <Button
            variant="primary"
            icon={<PlusCircle size={16} />}
            onClick={openStoreModal}
          >
            Add Store
          </Button>
        </div>
      </div>

      {/* Main Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Registered Users"
          value={stats?.totalUsers || 0}
          subtext="Admins, Store Owners & Users"
          icon={Users}
        />
        <StatCard
          label="Registered Stores"
          value={stats?.totalStores || 0}
          subtext="Active merchant storefronts"
          icon={Store}
        />
        <StatCard
          label="Total Customer Ratings"
          value={stats?.totalRatings || 0}
          subtext="Verified store reviews"
          icon={Star}
        />
        <StatCard
          label="Platform Average Rating"
          value={stats?.averagePlatformRating ? `${stats.averagePlatformRating} / 5` : '0.00'}
          subtext="Across all customer ratings"
          icon={Award}
        />
      </div>

      {/* Role Breakdown Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 30 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">User Distribution</div>
              <div className="card-subtitle">Active accounts by security role</div>
            </div>
            <ShieldCheck size={20} color="var(--color-primary)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)' }}>System Administrators</span>
              <span className="badge badge-admin">{stats?.roleCounts?.ADMIN || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)' }}>Store Owners</span>
              <span className="badge badge-owner">{stats?.roleCounts?.STORE_OWNER || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)' }}>Normal Shoppers</span>
              <span className="badge badge-user">{stats?.roleCounts?.USER || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Quick Navigation</div>
              <div className="card-subtitle">Direct access to administrative databases</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a
              href="/admin/users"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-slate-50)',
                color: 'var(--color-slate-800)',
                fontWeight: 600,
                border: '1px solid var(--color-slate-200)',
              }}
            >
              <span>Manage User Directory</span>
              <Users size={18} color="var(--color-primary)" />
            </a>
            <a
              href="/admin/stores"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-slate-50)',
                color: 'var(--color-slate-800)',
                fontWeight: 600,
                border: '1px solid var(--color-slate-200)',
              }}
            >
              <span>Manage Store Registry</span>
              <Store size={18} color="var(--color-primary)" />
            </a>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title="Add New User to System"
        footer={
          <>
            <Button variant="secondary" onClick={() => setUserModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={userSubmitting}
              onClick={handleCreateUser}
            >
              Create User
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
            label="System Role"
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
            label="Initial Password"
            name="password"
            type="password"
            value={userData.password}
            onChange={(e) => setUserData({ ...userData, password: e.target.value })}
            placeholder="8-16 chars with 1 uppercase & 1 special"
            error={userErrors.password}
            hint="8-16 characters, 1 uppercase, 1 special character"
            showPasswordToggle
            required
          />
        </form>
      </Modal>

      {/* Add Store Modal */}
      <Modal
        isOpen={storeModalOpen}
        onClose={() => setStoreModalOpen(false)}
        title="Register New Store"
        footer={
          <>
            <Button variant="secondary" onClick={() => setStoreModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={storeSubmitting}
              onClick={handleCreateStore}
            >
              Register Store
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateStore}>
          <Input
            label="Store Name"
            name="name"
            value={storeData.name}
            onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
            placeholder="e.g. Acme Supermarket"
            error={storeErrors.name}
            maxLength={60}
            required
          />

          <Input
            label="Store Email"
            name="email"
            type="email"
            value={storeData.email}
            onChange={(e) => setStoreData({ ...storeData, email: e.target.value })}
            placeholder="contact@store.com"
            error={storeErrors.email}
            required
          />

          <Select
            label="Designated Store Owner"
            name="ownerId"
            value={storeData.ownerId}
            onChange={(e) => setStoreData({ ...storeData, ownerId: e.target.value })}
            placeholder={
              eligibleOwners.length > 0
                ? 'Select an unassigned Store Owner'
                : 'No unassigned store owners available (create one first)'
            }
            options={eligibleOwners.map((o) => ({
              value: o.id,
              label: `${o.name} (${o.email})`,
            }))}
            error={storeErrors.ownerId}
            hint="Only users with role STORE_OWNER without an existing store are listed."
            required
          />

          <div className="form-group">
            <label className="form-label">
              <span>Store Address <span style={{ color: 'var(--color-danger)' }}>*</span></span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-400)' }}>
                {storeData.address.length}/400
              </span>
            </label>
            <textarea
              rows={2}
              value={storeData.address}
              onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
              placeholder="Store location address (max 400 chars)"
              maxLength={400}
              className={`form-textarea ${storeErrors.address ? 'has-error' : ''}`}
            />
            {storeErrors.address && <div className="form-error">{storeErrors.address}</div>}
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminDashboard;

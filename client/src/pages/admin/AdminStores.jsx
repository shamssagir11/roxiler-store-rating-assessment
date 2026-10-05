import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Store as StoreIcon } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  SearchBar,
  Button,
  SortableColumn,
  RatingStars,
  Modal,
  Input,
  Select,
  EmptyState,
  TableSkeleton,
} from '../../components/ui';
import { adminService } from '../../services/adminService';
import { validateStoreForm } from '../../utils/validation';
import { useToast } from '../../hooks/useToast';

export const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Add Store Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [eligibleOwners, setEligibleOwners] = useState([]);
  const [storeData, setStoreData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });
  const [storeErrors, setStoreErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getStores({
        search,
        sortBy,
        sortOrder,
      });
      setStores(res.data.stores || []);
    } catch (err) {
      toast.error('Failed to load stores directory.');
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortOrder, toast]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleOpenAddModal = async () => {
    try {
      const res = await adminService.getEligibleOwners();
      setEligibleOwners(res.data.owners || []);
      setAddModalOpen(true);
    } catch (err) {
      toast.error('Failed to load available store owners.');
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
    setSubmitting(true);
    try {
      await adminService.createStore(storeData);
      toast.success('Store registered successfully!');
      setAddModalOpen(false);
      setStoreData({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create store.';
      toast.error(msg);
      if (err.response?.data?.errors) {
        setStoreErrors(err.response.data.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Stores Registry">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Registered Merchant Stores</h2>
          <p style={{ color: 'var(--color-slate-500)', fontSize: '0.875rem' }}>
            Monitor stores, assign owners, and track aggregated rating scores
          </p>
        </div>
        <Button
          variant="primary"
          icon={<PlusCircle size={16} />}
          onClick={handleOpenAddModal}
        >
          Add New Store
        </Button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search stores by name, email, or address..."
          />
        </div>

        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : stores.length === 0 ? (
          <EmptyState
            icon={StoreIcon}
            title="No stores found"
            description="No merchant stores match your current query or no stores have been created yet."
            action={
              search ? (
                <Button variant="secondary" size="sm" onClick={() => setSearch('')}>
                  Clear Search
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={handleOpenAddModal}>
                  Register First Store
                </Button>
              )
            }
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <SortableColumn
                  label="Store Name"
                  field="name"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableColumn
                  label="Store Email"
                  field="email"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableColumn
                  label="Location Address"
                  field="address"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <th>Assigned Owner</th>
                <SortableColumn
                  label="Average Rating"
                  field="rating"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableColumn
                  label="Total Ratings"
                  field="ratingCount"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>
                    {s.name}
                  </td>
                  <td>{s.email}</td>
                  <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={s.address}>
                    {s.address}
                  </td>
                  <td>
                    {s.owner ? (
                      <div>
                        <div style={{ fontWeight: 600 }}>{s.owner.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-slate-400)' }}>
                          {s.owner.email}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--color-slate-400)' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <RatingStars rating={s.averageRating} showValue count={null} />
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '4px 10px',
                        backgroundColor: 'var(--color-slate-100)',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                      }}
                    >
                      {s.ratingCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Store Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Merchant Store"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={submitting}
              onClick={handleCreateStore}
            >
              Save Store
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
            placeholder="3 to 60 characters"
            error={storeErrors.name}
            maxLength={60}
            required
          />

          <Input
            label="Official Store Email"
            name="email"
            type="email"
            value={storeData.email}
            onChange={(e) => setStoreData({ ...storeData, email: e.target.value })}
            placeholder="store@domain.com"
            error={storeErrors.email}
            required
          />

          <Select
            label="Store Owner"
            name="ownerId"
            value={storeData.ownerId}
            onChange={(e) => setStoreData({ ...storeData, ownerId: e.target.value })}
            placeholder={
              eligibleOwners.length > 0
                ? 'Select an unassigned Store Owner'
                : 'No unassigned store owners available (create one in Users first)'
            }
            options={eligibleOwners.map((o) => ({
              value: o.id,
              label: `${o.name} (${o.email})`,
            }))}
            error={storeErrors.ownerId}
            hint="Owners can only manage one store at a time."
            required
          />

          <div className="form-group">
            <label className="form-label">
              <span>Physical Address <span style={{ color: 'var(--color-danger)' }}>*</span></span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-400)' }}>
                {storeData.address.length}/400
              </span>
            </label>
            <textarea
              rows={3}
              value={storeData.address}
              onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
              placeholder="Store location and address (max 400 chars)"
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

export default AdminStores;

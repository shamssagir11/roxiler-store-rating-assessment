import React, { useState, useEffect, useCallback } from 'react';
import { Store as StoreIcon, Star, MapPin, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  SearchBar,
  Button,
  RatingStars,
  Modal,
  EmptyState,
  LoadingSpinner,
} from '../../components/ui';
import { storeService, ratingService } from '../../services/storeService';
import { useToast } from '../../hooks/useToast';

export const UserStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Rating Modal state
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedScore, setSelectedScore] = useState(5);
  const [submittingRating, setSubmittingRating] = useState(false);

  const toast = useToast();

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const res = await storeService.getAllStores({
        search,
        sortBy,
        sortOrder,
      });
      setStores(res.data.stores || []);
    } catch (err) {
      toast.error('Failed to load stores.');
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortOrder, toast]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const openRatingModal = (store) => {
    setSelectedStore(store);
    setSelectedScore(store.userRating || 5);
    setRateModalOpen(true);
  };

  const handleRatingSubmit = async () => {
    if (!selectedStore) return;

    setSubmittingRating(true);
    try {
      const res = await ratingService.submitRating(selectedStore.id, selectedScore);
      toast.success(res.message || 'Rating submitted successfully!');
      setRateModalOpen(false);

      // Update store in local state directly
      setStores((prevStores) =>
        prevStores.map((s) => {
          if (s.id === selectedStore.id) {
            return {
              ...s,
              averageRating: res.data.averageRating,
              ratingCount: res.data.ratingCount,
              userRating: selectedScore,
            };
          }
          return s;
        })
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit rating.';
      toast.error(msg);
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <DashboardLayout title="Stores Directory & Ratings">
      {/* Header and Search */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Explore & Rate Stores</h2>
        <p style={{ color: 'var(--color-slate-500)', fontSize: '0.875rem', marginTop: 4 }}>
          Browse verified stores, view community reviews, and submit or update your ratings.
        </p>

        <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search stores by name or address..."
            style={{ minWidth: 300, flex: 1 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)', fontWeight: 600 }}>
              Sort by:
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="filter-select"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
              <option value="address-asc">Address (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stores Grid View */}
      {loading ? (
        <LoadingSpinner text="Loading stores and ratings..." />
      ) : stores.length === 0 ? (
        <EmptyState
          icon={StoreIcon}
          title="No stores found"
          description={
            search
              ? 'No stores match your search keyword. Try a different search query.'
              : 'No stores have been registered on the platform yet.'
          }
          action={
            search && (
              <Button variant="secondary" size="sm" onClick={() => setSearch('')}>
                Clear Search
              </Button>
            )
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {stores.map((store) => (
            <div
              key={store.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: store.userRating ? '1px solid var(--color-primary-border)' : '1px solid var(--color-slate-200)',
                backgroundColor: store.userRating ? '#fbfdff' : '#ffffff',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <h3
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: 'var(--color-slate-900)',
                      lineHeight: 1.3,
                    }}
                  >
                    {store.name}
                  </h3>
                  {store.userRating && (
                    <span
                      className="badge badge-success"
                      title={`You previously rated this store ${store.userRating} stars`}
                    >
                      <CheckCircle2 size={12} /> Rated ({store.userRating}★)
                    </span>
                  )}
                </div>

                {/* Overall Rating */}
                <div style={{ margin: '14px 0 16px' }}>
                  <RatingStars
                    rating={store.averageRating}
                    showValue
                    count={store.ratingCount}
                    size={20}
                  />
                </div>

                {/* Store Metadata */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem', color: 'var(--color-slate-600)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <MapPin size={16} color="var(--color-slate-400)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ lineHeight: 1.4 }}>{store.address}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mail size={16} color="var(--color-slate-400)" style={{ flexShrink: 0 }} />
                    <span>{store.email}</span>
                  </div>
                </div>
              </div>

              {/* User Rating Action Box */}
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: '1px solid var(--color-slate-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
                  {store.userRating ? (
                    <span>
                      Your rating: <strong style={{ color: 'var(--color-primary)' }}>{store.userRating} / 5 ★</strong>
                    </span>
                  ) : (
                    <span>Not rated yet</span>
                  )}
                </div>

                <Button
                  variant={store.userRating ? 'secondary' : 'primary'}
                  size="sm"
                  icon={<Star size={14} />}
                  onClick={() => openRatingModal(store)}
                >
                  {store.userRating ? 'Modify Rating' : 'Rate Store'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit / Modify Rating Modal */}
      <Modal
        isOpen={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        title={selectedStore?.userRating ? 'Update Your Rating' : 'Submit Store Rating'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={submittingRating}
              onClick={handleRatingSubmit}
            >
              {selectedStore?.userRating ? 'Update Rating' : 'Submit Rating'}
            </Button>
          </>
        }
      >
        {selectedStore && (
          <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>
              {selectedStore.name}
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)', marginTop: 4 }}>
              {selectedStore.address}
            </p>

            <div style={{ margin: '28px 0 16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-slate-700)', marginBottom: 12 }}>
                Select your rating (1 to 5 stars):
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <RatingStars
                  rating={selectedScore}
                  interactive
                  onChange={(star) => setSelectedScore(star)}
                  size={36}
                  showValue={false}
                />
              </div>
              <div style={{ marginTop: 12, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-slate-900)' }}>
                {selectedScore} / 5 Stars
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--color-slate-400)' }}>
              {selectedStore.userRating
                ? 'Your previous rating will be updated instantly.'
                : 'Your rating will contribute to this store’s overall platform average.'}
            </p>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default UserStores;

import React, { useState, useEffect, useCallback } from 'react';
import { Star, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  SearchBar,
  Button,
  SortableColumn,
  RatingStars,
  EmptyState,
  TableSkeleton,
} from '../../components/ui';
import { ownerService } from '../../services/storeService';
import { useToast } from '../../hooks/useToast';

export const OwnerRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const toast = useToast();

  const fetchRatings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ownerService.getRatings({
        search,
        ratingFilter,
        sortBy,
        sortOrder,
      });
      setRatings(res.data.ratings || []);
      if (res.data.storeName) {
        setStoreName(res.data.storeName);
      }
    } catch (err) {
      toast.error('Failed to load customer reviews.');
    } finally {
      setLoading(false);
    }
  }, [search, ratingFilter, sortBy, sortOrder, toast]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <DashboardLayout title="Customer Reviews & Ratings">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link to="/owner/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: 'var(--color-slate-500)' }}>
              <ArrowLeft size={16} /> Back to Overview
            </Link>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
            {storeName ? `${storeName} - Customer Feedback` : 'Store Customer Ratings'}
          </h2>
          <p style={{ color: 'var(--color-slate-500)', fontSize: '0.875rem' }}>
            Inspect customer ratings, shopper profiles, and review timestamps
          </p>
        </div>
      </div>

      <div className="table-container">
        {/* Table Toolbar */}
        <div className="table-toolbar">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by customer name, email, or address..."
          />

          <div className="table-filters">
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-500)', fontWeight: 600 }}>
              Stars:
            </label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : ratings.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No reviews found"
            description={
              search || ratingFilter
                ? 'No customer reviews match your filter parameters.'
                : 'No customers have rated your store yet.'
            }
            action={
              (search || ratingFilter) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setRatingFilter('');
                  }}
                >
                  Reset Filters
                </Button>
              )
            }
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <SortableColumn
                  label="Customer Name"
                  field="name"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <th>Email Address</th>
                <th>Customer Address</th>
                <SortableColumn
                  label="Rating Submitted"
                  field="rating"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableColumn
                  label="Review Date"
                  field="createdAt"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
              </tr>
            </thead>
            <tbody>
              {ratings.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>
                    {r.user.name}
                  </td>
                  <td>{r.user.email}</td>
                  <td style={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.user.address}>
                    {r.user.address}
                  </td>
                  <td>
                    <RatingStars rating={r.rating} showValue count={null} />
                  </td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OwnerRatings;

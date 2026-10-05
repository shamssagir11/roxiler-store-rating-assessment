import React, { useState, useEffect } from 'react';
import { Store, Star, Users, MapPin, Mail, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, RatingStars, Button, LoadingSpinner, EmptyState } from '../../components/ui';
import { ownerService } from '../../services/storeService';
import { useToast } from '../../hooks/useToast';

export const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await ownerService.getDashboard();
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load owner dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Store Owner Dashboard">
        <LoadingSpinner text="Loading your store analytics..." />
      </DashboardLayout>
    );
  }

  if (!data?.hasStore || !data?.store) {
    return (
      <DashboardLayout title="Store Owner Dashboard">
        <EmptyState
          icon={Store}
          title="No Store Assigned Yet"
          description="Your account has the STORE_OWNER role, but no store has been assigned to you by the System Administrator yet. Please contact the administrator to assign a store."
        />
      </DashboardLayout>
    );
  }

  const store = data.store;
  const distribution = store.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <DashboardLayout title="Store Owner Dashboard">
      {/* Store Banner Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          marginBottom: 30,
          border: 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="badge badge-owner" style={{ backgroundColor: 'rgba(37, 99, 235, 0.3)', color: '#93c5fd', borderColor: 'rgba(37, 99, 235, 0.5)' }}>
                Your Managed Store
              </span>
            </div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff' }}>
              {store.name}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 12, fontSize: '0.85rem', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} color="#94a3b8" />
                <span>{store.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={16} color="#94a3b8" />
                <span>{store.email}</span>
              </div>
            </div>
          </div>

          <Link to="/owner/ratings">
            <Button variant="primary" icon={<ArrowRight size={16} />}>
              View All Customer Reviews
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Average Store Rating"
          value={store.averageRating > 0 ? `${store.averageRating} / 5` : '0.00'}
          subtext="Computed from customer ratings"
          icon={Award}
        />
        <StatCard
          label="Total Customer Ratings"
          value={store.ratingCount}
          subtext="Total reviews submitted"
          icon={Star}
        />
        <StatCard
          label="Community Reach"
          value={store.ratingCount}
          subtext="Unique verified users who rated"
          icon={Users}
        />
      </div>

      {/* Ratings Distribution Breakdown */}
      <div className="card" style={{ maxWidth: 700 }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Rating Breakdown</h3>
            <p className="card-subtitle">Distribution of customer feedback across 1 to 5 stars</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RatingStars rating={store.averageRating} showValue={false} size={22} />
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-slate-900)' }}>
              {store.averageRating} ★
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[stars] || 0;
            const percentage = store.ratingCount > 0 ? Math.round((count / store.ratingCount) * 100) : 0;

            return (
              <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.875rem' }}>
                <div style={{ width: 60, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  <span>{stars}</span>
                  <Star size={14} fill="var(--color-star-active)" color="var(--color-star-active)" />
                </div>

                <div
                  style={{
                    flex: 1,
                    height: 10,
                    backgroundColor: 'var(--color-slate-100)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${percentage}%`,
                      backgroundColor:
                        stars >= 4 ? 'var(--color-success)' : stars === 3 ? 'var(--color-warning)' : 'var(--color-danger)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                <div style={{ width: 85, textAlign: 'right', color: 'var(--color-slate-500)', fontSize: '0.8rem', fontWeight: 500 }}>
                  {count} ({percentage}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;

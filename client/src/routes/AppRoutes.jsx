import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { ProtectedRoute, RoleProtectedRoute } from './RouteProtection';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ChangePassword from '../pages/auth/ChangePassword';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminStores from '../pages/admin/AdminStores';

// User Pages
import UserStores from '../pages/user/UserStores';

// Owner Pages
import OwnerDashboard from '../pages/owner/OwnerDashboard';
import OwnerRatings from '../pages/owner/OwnerRatings';

// Home Redirection Component based on active user role
const HomeRedirect = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user.role === 'STORE_OWNER') {
    return <Navigate to="/owner/dashboard" replace />;
  } else {
    return <Navigate to="/stores" replace />;
  }
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Profile & Security Route (Accessible to all authenticated users) */}
      <Route
        path="/profile/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* Admin Specific Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RoleProtectedRoute allowedRoles={['ADMIN']}>
            <AdminUsers />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/stores"
        element={
          <RoleProtectedRoute allowedRoles={['ADMIN']}>
            <AdminStores />
          </RoleProtectedRoute>
        }
      />

      {/* Normal User Specific Routes */}
      <Route
        path="/stores"
        element={
          <RoleProtectedRoute allowedRoles={['USER', 'ADMIN']}>
            <UserStores />
          </RoleProtectedRoute>
        }
      />

      {/* Store Owner Specific Routes */}
      <Route
        path="/owner/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={['STORE_OWNER']}>
            <OwnerDashboard />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/owner/ratings"
        element={
          <RoleProtectedRoute allowedRoles={['STORE_OWNER']}>
            <OwnerRatings />
          </RoleProtectedRoute>
        }
      />

      {/* Default and Fallback Redirects */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

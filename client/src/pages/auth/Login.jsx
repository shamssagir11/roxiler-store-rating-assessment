import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogIn, Sparkles } from 'lucide-react';
import { loginUser, clearError } from '../../slices/authSlice';
import { Input, Button } from '../../components/ui';
import { useToast } from '../../hooks/useToast';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Handle redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'STORE_OWNER') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/stores', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Check if session expired query param exists
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired')) {
      toast.warning('Your session has expired. Please log in again.');
    }
  }, [location.search, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!email.trim()) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    const resultAction = await dispatch(loginUser({ email: email.trim(), password }));

    if (loginUser.fulfilled.match(resultAction)) {
      toast.success('Logged in successfully!');
      const loggedUser = resultAction.payload.user;
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (loggedUser.role === 'STORE_OWNER') {
        navigate('/owner/dashboard');
      } else {
        navigate('/stores');
      }
    } else {
      toast.error(resultAction.payload || 'Invalid email or password.');
    }
  };

  // Demo credential autofill helper for easy review and testing
  const setDemoCredentials = (role) => {
    if (role === 'ADMIN') {
      setEmail('admin@demo.com');
      setPassword('Admin@1234');
    } else if (role === 'OWNER') {
      setEmail('owner@demo.com');
      setPassword('Owner@1234');
    } else if (role === 'USER') {
      setEmail('user@demo.com');
      setPassword('User@1234');
    }
    setFormErrors({});
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-badge" style={{ width: 48, height: 48, fontSize: '1.4rem' }}>
            R
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your Roxiler Store Rating account</p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-danger-border)',
              fontSize: '0.85rem',
              marginBottom: 20,
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: null }));
            }}
            placeholder="e.g. user@demo.com"
            error={formErrors.email}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: null }));
            }}
            placeholder="Enter your password"
            error={formErrors.password}
            showPasswordToggle
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            style={{ width: '100%', marginTop: 8 }}
            icon={<LogIn size={18} />}
          >
            Sign In
          </Button>
        </form>

        <div className="auth-demo-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--color-slate-800)' }}>
            <Sparkles size={14} color="var(--color-primary)" />
            <span>Quick Demo Logins</span>
          </div>
          <p style={{ marginTop: 2, fontSize: '0.72rem', color: 'var(--color-slate-500)' }}>
            Click any button below to autofill verified assessment credentials:
          </p>
          <div className="auth-demo-grid">
            <button
              type="button"
              className="auth-demo-btn"
              onClick={() => setDemoCredentials('ADMIN')}
            >
              Admin
            </button>
            <button
              type="button"
              className="auth-demo-btn"
              onClick={() => setDemoCredentials('OWNER')}
            >
              Store Owner
            </button>
            <button
              type="button"
              className="auth-demo-btn"
              onClick={() => setDemoCredentials('USER')}
            >
              Normal User
            </button>
          </div>
        </div>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

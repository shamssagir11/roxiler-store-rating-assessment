import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { UserPlus } from 'lucide-react';
import { registerUser } from '../../slices/authSlice';
import { Input, Button } from '../../components/ui';
import { validateUserForm } from '../../utils/validation';
import { useToast } from '../../hooks/useToast';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { loading } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateUserForm(formData, true);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});

    const result = await dispatch(
      registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        password: formData.password,
      })
    );

    if (registerUser.fulfilled.match(result)) {
      toast.success('Registration successful! Welcome to Roxiler Store Rating.');
      navigate('/stores');
    } else {
      const errorMsg = result.payload?.message || 'Registration failed. Please check the form.';
      toast.error(errorMsg);
      if (result.payload?.errors) {
        setFormErrors(result.payload.errors);
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-brand">
          <div className="brand-badge" style={{ width: 48, height: 48, fontSize: '1.4rem' }}>
            R
          </div>
          <h1 className="auth-title">Create an Account</h1>
          <p className="auth-subtitle">Register to discover and rate registered stores</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Between 20 and 60 characters"
            error={formErrors.name}
            maxLength={60}
            hint="Must be between 20 and 60 characters long"
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. john.doe@example.com"
            error={formErrors.email}
            required
          />

          <div className="form-group">
            <label className="form-label" htmlFor="address">
              <span>Address <span style={{ color: 'var(--color-danger)' }}>*</span></span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-400)', fontWeight: 400 }}>
                {formData.address.length}/400
              </span>
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="Your complete residential or office address (max 400 characters)"
              maxLength={400}
              className={`form-textarea ${formErrors.address ? 'has-error' : ''}`}
            />
            {formErrors.address && <div className="form-error">{formErrors.address}</div>}
          </div>

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="8-16 chars with 1 uppercase & 1 special char"
            error={formErrors.password}
            hint="8-16 characters, at least 1 uppercase and 1 special symbol (!@#$%...)"
            showPasswordToggle
            required
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            error={formErrors.confirmPassword}
            showPasswordToggle
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            style={{ width: '100%', marginTop: 8 }}
            icon={<UserPlus size={18} />}
          >
            Create Account
          </Button>
        </form>

        <div className="auth-footer">
          Already registered?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

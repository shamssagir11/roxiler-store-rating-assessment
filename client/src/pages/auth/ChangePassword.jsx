import React, { useState } from 'react';
import { KeyRound, Check } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Input, Button } from '../../components/ui';
import { authService } from '../../services/authService';
import { validatePasswordForm } from '../../utils/validation';
import { useToast } from '../../hooks/useToast';

export const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validatePasswordForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    setLoading(true);

    try {
      await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success('Password updated successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update password.';
      toast.error(msg);
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Change Password">
      <div style={{ maxWidth: 540 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Security & Password</h2>
              <p className="card-subtitle">
                Update your account password. Make sure it contains at least 8 characters, an uppercase letter, and a special symbol.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
              error={formErrors.currentPassword}
              showPasswordToggle
              required
            />

            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="8-16 characters with 1 uppercase & 1 special"
              error={formErrors.newPassword}
              hint="Must be 8-16 characters, 1 uppercase, 1 special character"
              showPasswordToggle
              required
            />

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your new password"
              error={formErrors.confirmPassword}
              showPasswordToggle
              required
            />

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                icon={<KeyRound size={16} />}
              >
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChangePassword;

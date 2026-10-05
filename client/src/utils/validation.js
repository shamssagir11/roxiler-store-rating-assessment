export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

/**
 * Validates user form data on the client side
 */
export const validateUserForm = (formData, isRegistering = true) => {
  const errors = {};

  if (!formData.name || !formData.name.trim()) {
    errors.name = 'Name is required';
  } else {
    const len = formData.name.trim().length;
    if (len < 20 || len > 60) {
      errors.name = 'Name must be between 20 and 60 characters';
    }
  }

  if (!formData.email || !formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(formData.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!formData.address || !formData.address.trim()) {
    errors.address = 'Address is required';
  } else if (formData.address.trim().length > 400) {
    errors.address = 'Address cannot exceed 400 characters';
  }

  if (isRegistering) {
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8 || formData.password.length > 16) {
      errors.password = 'Password must be between 8 and 16 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      errors.password = 'Password must contain at least one special character';
    }

    if (formData.confirmPassword !== undefined && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates store creation form data
 */
export const validateStoreForm = (formData) => {
  const errors = {};

  if (!formData.name || !formData.name.trim()) {
    errors.name = 'Store name is required';
  } else {
    const len = formData.name.trim().length;
    if (len < 3 || len > 60) {
      errors.name = 'Store name must be between 3 and 60 characters';
    }
  }

  if (!formData.email || !formData.email.trim()) {
    errors.email = 'Store email is required';
  } else if (!EMAIL_REGEX.test(formData.email.trim())) {
    errors.email = 'Please enter a valid store email address';
  }

  if (!formData.address || !formData.address.trim()) {
    errors.address = 'Store address is required';
  } else if (formData.address.trim().length > 400) {
    errors.address = 'Store address cannot exceed 400 characters';
  }

  if (!formData.ownerId) {
    errors.ownerId = 'Store owner must be selected';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates change password form
 */
export const validatePasswordForm = (formData) => {
  const errors = {};

  if (!formData.currentPassword) {
    errors.currentPassword = 'Current password is required';
  }

  if (!formData.newPassword) {
    errors.newPassword = 'New password is required';
  } else if (formData.newPassword.length < 8 || formData.newPassword.length > 16) {
    errors.newPassword = 'Password must be between 8 and 16 characters';
  } else if (!/[A-Z]/.test(formData.newPassword)) {
    errors.newPassword = 'Password must contain at least one uppercase letter';
  } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.newPassword)) {
    errors.newPassword = 'Password must contain at least one special character';
  }

  if (formData.confirmPassword !== undefined && formData.newPassword !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

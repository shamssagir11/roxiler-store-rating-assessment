const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

/**
 * Validates a user registration or creation payload
 * @param {object} data
 * @param {boolean} isCreation Whether password is required (e.g. registration / admin add user)
 */
const validateUserData = (data, isCreation = true) => {
  const errors = {};

  // Name validation: 20-60 characters
  if (!data.name || typeof data.name !== 'string') {
    errors.name = 'Name is required';
  } else {
    const trimmed = data.name.trim();
    if (trimmed.length < 20 || trimmed.length > 60) {
      errors.name = 'Name must be between 20 and 60 characters';
    }
  }

  // Email validation: valid email format
  if (!data.email || typeof data.email !== 'string') {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = 'Please provide a valid email address';
  }

  // Address validation: max 400 characters
  if (!data.address || typeof data.address !== 'string') {
    errors.address = 'Address is required';
  } else {
    const trimmed = data.address.trim();
    if (trimmed.length === 0) {
      errors.address = 'Address cannot be empty';
    } else if (trimmed.length > 400) {
      errors.address = 'Address must not exceed 400 characters';
    }
  }

  // Password validation: 8-16 characters, at least 1 uppercase, at least 1 special char
  if (isCreation) {
    if (!data.password || typeof data.password !== 'string') {
      errors.password = 'Password is required';
    } else if (data.password.length < 8 || data.password.length > 16) {
      errors.password = 'Password must be between 8 and 16 characters';
    } else if (!/[A-Z]/.test(data.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(data.password)) {
      errors.password = 'Password must contain at least one special character';
    }
  }

  // Role validation (if provided)
  if (data.role && !['ADMIN', 'USER', 'STORE_OWNER'].includes(data.role)) {
    errors.role = 'Role must be ADMIN, USER, or STORE_OWNER';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates a store creation or update payload
 */
const validateStoreData = (data) => {
  const errors = {};

  // Store name validation: 3-60 characters
  if (!data.name || typeof data.name !== 'string') {
    errors.name = 'Store name is required';
  } else {
    const trimmed = data.name.trim();
    if (trimmed.length < 3 || trimmed.length > 60) {
      errors.name = 'Store name must be between 3 and 60 characters';
    }
  }

  // Email validation: valid email format
  if (!data.email || typeof data.email !== 'string') {
    errors.email = 'Store email is required';
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = 'Please provide a valid store email address';
  }

  // Address validation: max 400 characters
  if (!data.address || typeof data.address !== 'string') {
    errors.address = 'Store address is required';
  } else {
    const trimmed = data.address.trim();
    if (trimmed.length === 0) {
      errors.address = 'Store address cannot be empty';
    } else if (trimmed.length > 400) {
      errors.address = 'Store address must not exceed 400 characters';
    }
  }

  // Owner ID validation
  if (!data.ownerId || typeof data.ownerId !== 'string') {
    errors.ownerId = 'Store owner ID is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates a rating submission (1-5 integer)
 */
const validateRatingData = (data) => {
  const errors = {};

  if (data.rating === undefined || data.rating === null) {
    errors.rating = 'Rating is required';
  } else {
    const num = Number(data.rating);
    if (!Number.isInteger(num) || num < 1 || num > 5) {
      errors.rating = 'Rating must be an integer between 1 and 5';
    }
  }

  if (!data.storeId || typeof data.storeId !== 'string') {
    errors.storeId = 'Store ID is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates password change
 */
const validatePasswordChange = (data) => {
  const errors = {};

  if (!data.currentPassword || typeof data.currentPassword !== 'string') {
    errors.currentPassword = 'Current password is required';
  }

  if (!data.newPassword || typeof data.newPassword !== 'string') {
    errors.newPassword = 'New password is required';
  } else if (data.newPassword.length < 8 || data.newPassword.length > 16) {
    errors.newPassword = 'Password must be between 8 and 16 characters';
  } else if (!/[A-Z]/.test(data.newPassword)) {
    errors.newPassword = 'Password must contain at least one uppercase letter';
  } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(data.newPassword)) {
    errors.newPassword = 'Password must contain at least one special character';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = {
  validateUserData,
  validateStoreData,
  validateRatingData,
  validatePasswordChange,
  EMAIL_REGEX,
  PASSWORD_REGEX,
};

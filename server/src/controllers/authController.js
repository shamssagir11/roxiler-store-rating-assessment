const prisma = require('../config/db');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { validateUserData, validatePasswordChange } = require('../validators');

/**
 * Register a new user (default role: USER)
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, address } = req.body;

    // Strict validation
    const validation = validateUserData({ name, email, password, address, role: 'USER' }, true);
    if (!validation.isValid) {
      return errorResponse(res, 400, 'Validation failed', validation.errors);
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return errorResponse(res, 409, 'An account with this email already exists.', {
        email: 'Email is already registered',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: trimmedEmail,
        passwordHash,
        address: address.trim(),
        role: 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken({ id: newUser.id, role: newUser.role });

    return successResponse(res, 201, 'Registration successful', {
      user: newUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Universal Login for all roles (ADMIN, USER, STORE_OWNER)
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required', {
        ...(!email && { email: 'Email is required' }),
        ...(!password && { password: 'Password is required' }),
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    // Generate token
    const token = generateToken({ id: user.id, role: user.role });

    // Exclude passwordHash in response
    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
    };

    return successResponse(res, 200, 'Login successful', {
      user: userPayload,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    return successResponse(res, 200, 'User profile retrieved successfully', {
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password for authenticated user
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const validation = validatePasswordChange({ currentPassword, newPassword });
    if (!validation.isValid) {
      return errorResponse(res, 400, 'Validation failed', validation.errors);
    }

    // Fetch user with password hash
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    // Verify current password
    const isCurrentValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return errorResponse(res, 400, 'Current password is incorrect.', {
        currentPassword: 'Incorrect current password',
      });
    }

    // Ensure new password differs from current
    const isSamePassword = await comparePassword(newPassword, user.passwordHash);
    if (isSamePassword) {
      return errorResponse(res, 400, 'New password cannot be the same as current password.', {
        newPassword: 'New password must be different from current password',
      });
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    return successResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
};

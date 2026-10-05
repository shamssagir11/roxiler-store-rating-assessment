const prisma = require('../config/db');
const { hashPassword } = require('../utils/auth');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { validateUserData, validateStoreData } = require('../validators');

/**
 * Get Admin Dashboard Overview Statistics
 * GET /api/admin/dashboard
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalStores, totalRatings, usersByRole, ratingAggregate] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: { _all: true },
      }),
      prisma.rating.aggregate({
        _avg: { rating: true },
      }),
    ]);

    const roleCounts = {
      ADMIN: 0,
      USER: 0,
      STORE_OWNER: 0,
    };

    usersByRole.forEach((item) => {
      roleCounts[item.role] = item._count._all;
    });

    const averagePlatformRating = ratingAggregate._avg.rating
      ? Number(ratingAggregate._avg.rating.toFixed(2))
      : 0;

    return successResponse(res, 200, 'Admin dashboard statistics retrieved', {
      totalUsers,
      totalStores,
      totalRatings,
      roleCounts,
      averagePlatformRating,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users with search, role filter, and sorting
 * GET /api/admin/users
 */
const getUsers = async (req, res, next) => {
  try {
    const { search = '', role, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const where = {};

    // Role filter
    if (role && ['ADMIN', 'USER', 'STORE_OWNER'].includes(role)) {
      where.role = role;
    }

    // Search filter across name, email, and address
    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Sorting
    const allowedSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
    const actualSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const actualSortOrder = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const users = await prisma.user.findMany({
      where,
      orderBy: { [actualSortBy]: actualSortOrder },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        store: {
          select: {
            id: true,
            name: true,
            ratings: {
              select: { rating: true },
            },
          },
        },
      },
    });

    // Format response to include store rating summary for store owners
    const formattedUsers = users.map((u) => {
      let storeInfo = null;
      if (u.store) {
        const ratingCount = u.store.ratings.length;
        const avgRating =
          ratingCount > 0
            ? Number((u.store.ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratingCount).toFixed(2))
            : 0;

        storeInfo = {
          id: u.store.id,
          name: u.store.name,
          ratingCount,
          averageRating: avgRating,
        };
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        address: u.address,
        role: u.role,
        createdAt: u.createdAt,
        store: storeInfo,
      };
    });

    return successResponse(res, 200, 'Users retrieved successfully', {
      users: formattedUsers,
      total: formattedUsers.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed information for a single user
 * GET /api/admin/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        store: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            createdAt: true,
            ratings: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, address: true },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        ratings: {
          include: {
            store: {
              select: { id: true, name: true, address: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    let storeDetails = null;
    if (user.store) {
      const ratingCount = user.store.ratings.length;
      const averageRating =
        ratingCount > 0
          ? Number((user.store.ratings.reduce((acc, r) => acc + r.rating, 0) / ratingCount).toFixed(2))
          : 0;

      storeDetails = {
        id: user.store.id,
        name: user.store.name,
        email: user.store.email,
        address: user.store.address,
        averageRating,
        ratingCount,
        ratings: user.store.ratings.map((r) => ({
          id: r.id,
          rating: r.rating,
          createdAt: r.createdAt,
          user: r.user,
        })),
      };
    }

    return successResponse(res, 200, 'User details retrieved successfully', {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
        store: storeDetails,
        givenRatingsCount: user.ratings.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin creates a new user (can specify role: ADMIN, USER, or STORE_OWNER)
 * POST /api/admin/users
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role = 'USER' } = req.body;

    const validation = validateUserData({ name, email, password, address, role }, true);
    if (!validation.isValid) {
      return errorResponse(res, 400, 'Validation failed', validation.errors);
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existing) {
      return errorResponse(res, 409, 'An account with this email already exists.', {
        email: 'Email is already registered',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: trimmedEmail,
        passwordHash,
        address: address.trim(),
        role,
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

    return successResponse(res, 201, 'User created successfully', {
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all stores with search, average rating calculation, and sorting
 * GET /api/admin/stores
 */
const getStores = async (req, res, next) => {
  try {
    const { search = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

    const where = {};

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Fetch stores with owner and ratings
    const stores = await prisma.store.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Compute average rating and count
    const formattedStores = stores.map((s) => {
      const ratingCount = s.ratings.length;
      const totalScore = s.ratings.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = ratingCount > 0 ? Number((totalScore / ratingCount).toFixed(2)) : 0;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        createdAt: s.createdAt,
        owner: s.owner,
        ratingCount,
        averageRating,
      };
    });

    // Sort formatted stores
    const actualSortOrder = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
    formattedStores.sort((a, b) => {
      if (sortBy === 'rating' || sortBy === 'averageRating') {
        return (a.averageRating - b.averageRating) * actualSortOrder;
      }
      if (sortBy === 'ratingCount') {
        return (a.ratingCount - b.ratingCount) * actualSortOrder;
      }
      if (sortBy === 'createdAt') {
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * actualSortOrder;
      }
      if (sortBy === 'email') {
        return a.email.localeCompare(b.email) * actualSortOrder;
      }
      if (sortBy === 'address') {
        return a.address.localeCompare(b.address) * actualSortOrder;
      }
      // default: name
      return a.name.localeCompare(b.name) * actualSortOrder;
    });

    return successResponse(res, 200, 'Stores retrieved successfully', {
      stores: formattedStores,
      total: formattedStores.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin creates a new store
 * POST /api/admin/stores
 */
const createStore = async (req, res, next) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const validation = validateStoreData({ name, email, address, ownerId });
    if (!validation.isValid) {
      return errorResponse(res, 400, 'Validation failed', validation.errors);
    }

    // Verify owner exists and has STORE_OWNER role
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      include: { store: true },
    });

    if (!owner) {
      return errorResponse(res, 404, 'Designated store owner not found.', {
        ownerId: 'User does not exist',
      });
    }

    if (owner.role !== 'STORE_OWNER') {
      return errorResponse(res, 400, 'User must have STORE_OWNER role to own a store.', {
        ownerId: 'User is not a store owner',
      });
    }

    if (owner.store) {
      return errorResponse(res, 400, 'This owner already has an assigned store.', {
        ownerId: 'Owner already manages another store',
      });
    }

    // Create the store
    const newStore = await prisma.store.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        ownerId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return successResponse(res, 201, 'Store created successfully', {
      store: {
        ...newStore,
        averageRating: 0,
        ratingCount: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get store owners who do not currently own a store (eligible for assignment)
 * GET /api/admin/eligible-owners
 */
const getEligibleOwners = async (req, res, next) => {
  try {
    const eligibleOwners = await prisma.user.findMany({
      where: {
        role: 'STORE_OWNER',
        store: null, // does not have a store yet
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
      },
      orderBy: { name: 'asc' },
    });

    return successResponse(res, 200, 'Eligible store owners retrieved', {
      owners: eligibleOwners,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getUserById,
  createUser,
  getStores,
  createStore,
  getEligibleOwners,
};

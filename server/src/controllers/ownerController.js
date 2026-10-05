const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get Store Owner Dashboard stats and store details
 * GET /api/owner/dashboard
 */
const getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // Find the store owned by this user
    const store = await prisma.store.findUnique({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                address: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!store) {
      return successResponse(res, 200, 'No store assigned yet.', {
        hasStore: false,
        store: null,
      });
    }

    const ratingCount = store.ratings.length;
    const totalScore = store.ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = ratingCount > 0 ? Number((totalScore / ratingCount).toFixed(2)) : 0;

    // Distribution of ratings (how many 5s, 4s, 3s, 2s, 1s)
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    store.ratings.forEach((r) => {
      if (ratingDistribution[r.rating] !== undefined) {
        ratingDistribution[r.rating]++;
      }
    });

    return successResponse(res, 200, 'Owner dashboard retrieved successfully', {
      hasStore: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        createdAt: store.createdAt,
        averageRating,
        ratingCount,
        ratingDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get list of ratings for the owner's store
 * GET /api/owner/ratings
 */
const getOwnerRatings = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { search = '', ratingFilter, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const store = await prisma.store.findUnique({
      where: { ownerId },
    });

    if (!store) {
      return errorResponse(res, 404, 'No store associated with this owner account.');
    }

    const where = {
      storeId: store.id,
    };

    // Filter by specific rating score if provided
    if (ratingFilter) {
      const num = Number(ratingFilter);
      if (num >= 1 && num <= 5) {
        where.rating = num;
      }
    }

    // Search by user name, email, or address
    if (search && search.trim() !== '') {
      const q = search.trim();
      where.user = {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
        ],
      };
    }

    const ratings = await prisma.rating.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
          },
        },
      },
      orderBy: {
        [sortBy === 'rating' ? 'rating' : 'createdAt']: sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc',
      },
    });

    const formattedRatings = ratings.map((r) => ({
      id: r.id,
      rating: r.rating,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        address: r.user.address,
      },
    }));

    return successResponse(res, 200, 'Owner ratings retrieved successfully', {
      storeName: store.name,
      ratings: formattedRatings,
      total: formattedRatings.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOwnerDashboard,
  getOwnerRatings,
};

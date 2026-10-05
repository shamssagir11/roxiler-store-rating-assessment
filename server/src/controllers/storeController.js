const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get all stores for users, including overall rating and current user's rating
 * GET /api/stores
 */
const getAllStores = async (req, res, next) => {
  try {
    const { search = '', sortBy = 'name', sortOrder = 'asc' } = req.query;
    const currentUserId = req.user ? req.user.id : null;

    const where = {};

    // Search stores by name or address
    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
      ];
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        ratings: {
          select: {
            id: true,
            userId: true,
            rating: true,
          },
        },
      },
    });

    // Format store data with aggregated rating and current user's rating
    const formattedStores = stores.map((s) => {
      const ratingCount = s.ratings.length;
      const totalScore = s.ratings.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = ratingCount > 0 ? Number((totalScore / ratingCount).toFixed(2)) : 0;

      // Find current user's rating if logged in
      const userRatingRecord = currentUserId ? s.ratings.find((r) => r.userId === currentUserId) : null;
      const userRating = userRatingRecord ? userRatingRecord.rating : null;
      const userRatingId = userRatingRecord ? userRatingRecord.id : null;

      return {
        id: s.id,
        name: s.name,
        address: s.address,
        email: s.email,
        createdAt: s.createdAt,
        averageRating,
        ratingCount,
        userRating,
        userRatingId,
      };
    });

    // Sorting
    const actualSortOrder = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
    formattedStores.sort((a, b) => {
      if (sortBy === 'rating' || sortBy === 'averageRating') {
        return (a.averageRating - b.averageRating) * actualSortOrder;
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
 * Get single store details
 * GET /api/stores/:id
 */
const getStoreById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        ratings: {
          select: {
            id: true,
            userId: true,
            rating: true,
          },
        },
      },
    });

    if (!store) {
      return errorResponse(res, 404, 'Store not found.');
    }

    const ratingCount = store.ratings.length;
    const totalScore = store.ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = ratingCount > 0 ? Number((totalScore / ratingCount).toFixed(2)) : 0;

    const userRatingRecord = currentUserId ? store.ratings.find((r) => r.userId === currentUserId) : null;
    const userRating = userRatingRecord ? userRatingRecord.rating : null;

    return successResponse(res, 200, 'Store retrieved successfully', {
      store: {
        id: store.id,
        name: store.name,
        address: store.address,
        email: store.email,
        averageRating,
        ratingCount,
        userRating,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStores,
  getStoreById,
};

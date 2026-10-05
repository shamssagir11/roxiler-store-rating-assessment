const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { validateRatingData } = require('../validators');

/**
 * Submit or update rating for a store
 * POST /api/ratings
 */
const submitOrUpdateRating = async (req, res, next) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    // Validate rating (1-5 integer) and storeId
    const validation = validateRatingData({ storeId, rating });
    if (!validation.isValid) {
      return errorResponse(res, 400, 'Validation failed', validation.errors);
    }

    const ratingValue = Number(rating);

    // Verify store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return errorResponse(res, 404, 'Store not found.');
    }

    // Check if user is the owner of this store (owner shouldn't rate their own store)
    if (store.ownerId === userId) {
      return errorResponse(res, 403, 'Store owners cannot rate their own store.');
    }

    // Use Prisma transaction to upsert rating and compute fresh store stats
    const result = await prisma.$transaction(async (tx) => {
      const existingRating = await tx.rating.findUnique({
        where: {
          userId_storeId: {
            userId,
            storeId,
          },
        },
      });

      let ratingRecord;
      let isNew = false;

      if (existingRating) {
        ratingRecord = await tx.rating.update({
          where: { id: existingRating.id },
          data: { rating: ratingValue },
        });
      } else {
        isNew = true;
        ratingRecord = await tx.rating.create({
          data: {
            userId,
            storeId,
            rating: ratingValue,
          },
        });
      }

      // Compute updated store average
      const allRatings = await tx.rating.findMany({
        where: { storeId },
        select: { rating: true },
      });

      const ratingCount = allRatings.length;
      const totalScore = allRatings.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = ratingCount > 0 ? Number((totalScore / ratingCount).toFixed(2)) : 0;

      return {
        ratingRecord,
        isNew,
        averageRating,
        ratingCount,
      };
    });

    const actionText = result.isNew ? 'Rating submitted successfully' : 'Rating updated successfully';

    return successResponse(res, 200, actionText, {
      rating: result.ratingRecord,
      averageRating: result.averageRating,
      ratingCount: result.ratingCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all ratings submitted by current user
 * GET /api/ratings/my
 */
const getMyRatings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const ratings = await prisma.rating.findMany({
      where: { userId },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            email: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return successResponse(res, 200, 'User ratings retrieved successfully', {
      ratings,
      total: ratings.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitOrUpdateRating,
  getMyRatings,
};

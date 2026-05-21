import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import { checkAuth, UserRole } from "../../app/middleware/auth";
import checkUserBanStatus from "../../app/middleware/checkBanStatus";
import { reviewController } from "./review.controller";

const reviewRoutes: ExpressRouter = Router();

reviewRoutes.post(
    "/create",
    checkAuth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
    checkUserBanStatus,
    reviewController.createReview,
);

reviewRoutes.get(
    "/my",
    checkAuth(UserRole.STUDENT, UserRole.ADMIN, UserRole.TUTOR),
    reviewController.getMyReviews,
);

reviewRoutes.get(
    "/:tutorProfileId",
    reviewController.getReviewsByTutorProfileId,
);

reviewRoutes.delete(
    "/:reviewId/",
    checkAuth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
    checkUserBanStatus,
    reviewController.deleteReview,
);

export default reviewRoutes;

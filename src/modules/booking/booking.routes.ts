import { Router, type Router as ExpressRouter } from "express";
// import auth, { UserRole } from "../../middleware/auth";
// import checkUserBanStatus from "../../middleware/checkBanStatus";
import checkUserBanStatus from "../../app/middleware/checkBanStatus";

import { checkAuth, UserRole } from "../../app/middleware/auth";
import { bookingController } from "./booking.controller";

const bookingRoutes: ExpressRouter = Router();

bookingRoutes.post(
    "/create",
    checkAuth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
    checkUserBanStatus,
    bookingController.createBooking,
);

bookingRoutes.get(
    "/my-sessions",
    checkAuth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
    bookingController.mySessions,
);
bookingRoutes.get(
    "/upcoming",
    checkAuth(UserRole.STUDENT, UserRole.ADMIN, UserRole.TUTOR),
    bookingController.upcomingSession,
);

bookingRoutes.get(
    "/teaching",
    checkAuth(UserRole.TUTOR, UserRole.ADMIN),
    bookingController.teachingSession,
);

bookingRoutes.get(
    "/getAllBooking",
    checkAuth(UserRole.ADMIN),
    bookingController.getAllBooking,
);

bookingRoutes.patch(
    "/:id/status",
    checkAuth(UserRole.ADMIN, UserRole.TUTOR),
    bookingController.bookingStatus,
);

export default bookingRoutes;

import { Router, type Router as ExpressRouter } from "express";

import { checkAuth, UserRole } from "../../app/middleware/auth";
import checkUserBanStatus from "../../app/middleware/checkBanStatus";
import { availabilityController } from "./availability.controller";

const availabilityRoutes: ExpressRouter = Router();

availabilityRoutes.post(
    "/create",
    checkAuth(UserRole.TUTOR, UserRole.ADMIN),
    checkUserBanStatus,
    availabilityController.createAvailability,
);

availabilityRoutes.get(
    "/me",
    checkAuth(UserRole.TUTOR, UserRole.ADMIN),
    availabilityController.getOwnAvailability,
);

availabilityRoutes.get(
    "/:tutorId",
    availabilityController.getAvailibilityByTutorId,
);

availabilityRoutes.get(
    "/:tutorId/with-bookings",
    availabilityController.getAvailabilityWithBookings,
);

availabilityRoutes.get(
    "/:tutorProfileId/available-dates",
    availabilityController.getAvailableDatesInMonth,
);

availabilityRoutes.patch(
    "/update/:slotId",
    checkAuth(UserRole.ADMIN, UserRole.TUTOR),
    availabilityController.updateAvailability,
);

availabilityRoutes.delete(
    "/delete/:slotId",
    checkAuth(UserRole.ADMIN, UserRole.TUTOR),
    availabilityController.deleteAvailability,
);

export default availabilityRoutes;

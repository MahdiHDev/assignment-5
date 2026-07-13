import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import { checkAuth, UserRole } from "../../app/middleware/auth";
import checkUserBanStatus from "../../app/middleware/checkBanStatus";
import { TutorController } from "./tutor.controller";

const tutorRoutes: ExpressRouter = Router();

tutorRoutes.get("/getAllTutors", TutorController.getAllTutors);

tutorRoutes.get(
    "/getAllTutors/admin",
    checkAuth(UserRole.ADMIN),
    TutorController.getAllTutors,
);

tutorRoutes.get(
    "/getMyProfile",
    checkAuth(UserRole.TUTOR, UserRole.ADMIN),
    TutorController.getTutorProfileByUserId,
);

tutorRoutes.get(
    "/getTeachingSession",
    checkAuth(UserRole.TUTOR, UserRole.ADMIN),
    TutorController.getTeachingSession,
);

tutorRoutes.get("/:tutorProfileId", TutorController.getTutorProfileById);

tutorRoutes.post(
    "/create",
    checkAuth(UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR),
    checkUserBanStatus,
    TutorController.createTutorProfile,
);

tutorRoutes.post(
    "/createTeachingSession",
    checkAuth(UserRole.TUTOR, UserRole.ADMIN),
    checkUserBanStatus,
    TutorController.createTeachingSession,
);

tutorRoutes.patch(
    "/approve",
    checkAuth(UserRole.ADMIN),
    TutorController.approveTutorProfile,
);

tutorRoutes.put(
    "/updateTutorProfile",
    checkAuth(UserRole.TUTOR, UserRole.ADMIN),
    TutorController.updateTutorProfile,
);

tutorRoutes.put(
    "/updateTeachingSession/:tutorSessionId",
    checkAuth(UserRole.TUTOR, UserRole.ADMIN),
    checkUserBanStatus,
    TutorController.updateTeachingSession,
);

tutorRoutes.delete(
    "/deleteTeachingSession/:tutorSessionId",
    checkAuth(UserRole.TUTOR, UserRole.ADMIN),
    TutorController.deleteTeachingSession,
);

export default tutorRoutes;

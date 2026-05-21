import type { Router as ExpressRouter } from "express";
import { Router } from "express";
// import auth, { UserRole } from "../../middleware/auth";
import { checkAuth, UserRole } from "../../app/middleware/auth";
import { SubjectController } from "./subject.controller";

const subjectRoutes: ExpressRouter = Router();

subjectRoutes.post(
    "/create",
    checkAuth(UserRole.ADMIN),
    SubjectController.createSubject,
);

subjectRoutes.get("/getAllSubjects", SubjectController.getAllSubjects);

subjectRoutes.patch(
    "/update/:id",
    checkAuth(UserRole.ADMIN),
    SubjectController.updateSubject,
);

subjectRoutes.delete(
    "/delete/:id",
    checkAuth(UserRole.ADMIN),
    SubjectController.deleteSubject,
);

export default subjectRoutes;

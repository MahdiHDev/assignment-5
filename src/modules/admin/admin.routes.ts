import { Router, type Router as ExpressRouter } from "express";
import { checkAuth, UserRole } from "../../app/middleware/auth";
import { adminController } from "./admin.controller";

const adminRoutes: ExpressRouter = Router();

adminRoutes.get("/users", adminController.getAllUsers);

adminRoutes.patch(
    "/users/:id/status",
    checkAuth(UserRole.ADMIN),
    adminController.updateUserStatus,
);

export default adminRoutes;

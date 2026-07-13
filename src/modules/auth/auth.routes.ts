import { Router, type Router as ExpressRouter } from "express";

import { checkAuth, UserRole } from "../../app/middleware/auth";

import { AuthController } from "./auth.controller";

const router: ExpressRouter = Router();

router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);
router.post("/refresh-token", AuthController.getNewToken);
router.post(
    "/change-password",
    checkAuth(UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR),
    AuthController.changePassword,
);
router.post(
    "/logout",
    checkAuth(UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR),
    AuthController.logoutUser,
);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);

export const AuthRoutes = router;

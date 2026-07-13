// src/app/module/payment/payment.routes.ts
import { Router, type Router as ExpressRouter } from "express";
import { checkAuth, UserRole } from "../../app/middleware/auth";
import { PaymentController } from "./payment.controller";

const router: ExpressRouter = Router();

// Student initiates checkout for their booking
router.post(
    "/checkout/:bookingId",
    checkAuth(UserRole.STUDENT),
    PaymentController.createCheckoutSession,
);

// Refund a payment (student or admin)
router.post(
    "/refund/:bookingId",
    checkAuth(UserRole.STUDENT, UserRole.ADMIN),
    PaymentController.refundPayment,
);

export const PaymentRoutes = router;

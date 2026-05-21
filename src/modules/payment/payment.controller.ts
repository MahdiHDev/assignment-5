// src/app/module/payment/payment.controller.ts
import { Request, Response } from "express";
import { stripe } from "../../app/config/stripe.config";
import { IRequestUser, PaymentService } from "./payment.service";

// ─── Create Checkout Session ───────────────────────────────────────────────

const createCheckoutSession = async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const { bookingId } = req.params;

    const result = await PaymentService.createCheckoutSession(
        bookingId as string,
        user,
    );

    res.status(200).json({
        success: true,
        message: "Checkout session created successfully",
        data: result,
    });
};

// ─── Webhook ───────────────────────────────────────────────────────────────

const handleStripeWebhookEvent = async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
        console.error("Missing Stripe signature or webhook secret");
        return res.status(400).json({
            message: "Missing Stripe signature or webhook secret",
        });
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body, // raw Buffer — must use express.raw()
            signature,
            webhookSecret,
        );
    } catch (error: any) {
        console.error("Webhook signature verification failed:", error.message);
        return res.status(400).json({ message: "Invalid webhook signature" });
    }

    try {
        const result = await PaymentService.handlerStripeWebhookEvent(event);

        res.status(200).json({
            success: true,
            message: "Stripe webhook event processed successfully",
            data: result,
        });
    } catch (error) {
        console.error("Error handling Stripe webhook event:", error);
        res.status(500).json({
            success: false,
            message: "Error handling Stripe webhook event",
        });
    }
};

// ─── Refund ────────────────────────────────────────────────────────────────

const refundPayment = async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const { bookingId } = req.params;

    const result = await PaymentService.refundPayment(
        bookingId as string,
        user,
    );

    res.status(200).json({
        success: true,
        message: "Payment refunded successfully",
        data: result,
    });
};

// ─── Export ────────────────────────────────────────────────────────────────

export const PaymentController = {
    createCheckoutSession,
    handleStripeWebhookEvent,
    refundPayment,
};

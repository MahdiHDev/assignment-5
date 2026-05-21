// src/app/module/payment/payment.service.ts
import Stripe from "stripe";
import { stripe } from "../../app/config/stripe.config";
import { BookingStatus, PaymentStatus, UserRole } from "../../generated/enums";
import { prisma } from "../../lib/prisma";

export interface IRequestUser {
    email: string;
    name: string;
    role: UserRole;
    emailVerified: true;
}

// ─── Create Checkout Session ───────────────────────────────────────────────

const createCheckoutSession = async (bookingId: string, user: IRequestUser) => {
    const studentData = await prisma.user.findUniqueOrThrow({
        where: { email: user.email },
    });

    const booking = await prisma.booking.findUniqueOrThrow({
        where: {
            id: bookingId,
            studentId: studentData.id,
        },
        include: {
            tutorCategory: {
                include: { subject: true },
            },
        },
    });

    const existingPayment = await prisma.payment.findUnique({
        where: { bookingId },
    });

    if (existingPayment?.status === PaymentStatus.SUCCEEDED) {
        throw new Error("Payment already completed for this booking");
    }

    if (booking.status === BookingStatus.CANCELLED) {
        throw new Error("This booking is cancelled");
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `Tutoring: ${booking.tutorCategory.subject.name}`,
                        description: `Session on ${booking.sessionDate.toDateString()}`,
                    },
                    unit_amount: Math.round(booking.price * 100), // Stripe uses cents
                },
                quantity: 1,
            },
        ],
        metadata: {
            bookingId: booking.id,
            studentId: studentData.id,
        },
        success_url: `${process.env.FRONTEND_URL}/bookings/${booking.id}?payment=success`,
        cancel_url: `${process.env.FRONTEND_URL}/bookings/${booking.id}?payment=cancelled`,
    });

    // Upsert — safe for retries
    const payment = await prisma.payment.upsert({
        where: { bookingId },
        create: {
            bookingId,
            studentId: studentData.id,
            amount: booking.price,
            currency: "usd",
            status: PaymentStatus.PENDING,
            stripeSessionId: session.id,
        },
        update: {
            stripeSessionId: session.id,
            status: PaymentStatus.PENDING,
        },
    });

    return {
        paymentUrl: session.url,
        paymentId: payment.id,
    };
};

// ─── Webhook Handler ───────────────────────────────────────────────────────

const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
    // Idempotency — skip already processed events
    const existingPayment = await prisma.payment.findFirst({
        where: { stripeEventId: event.id },
    });

    if (existingPayment) {
        console.log(`Event ${event.id} already processed. Skipping`);
        return { message: `Event ${event.id} already processed. Skipping` };
    }

    switch (event.type) {
        // ── Payment Succeeded ────────────────────────────────────────────────
        case "checkout.session.completed": {
            const session = event.data.object;

            const { bookingId } = session.metadata ?? {};

            if (!bookingId) {
                console.error("Missing bookingId in session metadata");
                return { message: "Missing bookingId in session metadata" };
            }

            const booking = await prisma.booking.findUnique({
                where: { id: bookingId },
            });

            if (!booking) {
                console.error(`Booking with id ${bookingId} not found`);
                return { message: `Booking with id ${bookingId} not found` };
            }

            const isPaid = session.payment_status === "paid";

            await prisma.$transaction(async (tx) => {
                await tx.payment.update({
                    where: { stripeSessionId: session.id },
                    data: {
                        stripeEventId: event.id,
                        stripePaymentIntentId: session.payment_intent as string,
                        status: isPaid
                            ? PaymentStatus.SUCCEEDED
                            : PaymentStatus.FAILED,
                        paidAt: isPaid ? new Date() : null,
                    },
                });

                await tx.booking.update({
                    where: { id: bookingId },
                    data: {
                        status: isPaid
                            ? BookingStatus.CONFIRMED
                            : BookingStatus.PENDING,
                    },
                });
            });

            console.log(
                `checkout.session.completed → booking ${bookingId} marked ${isPaid ? "CONFIRMED" : "PENDING"}`,
            );
            break;
        }

        // ── Session Expired ──────────────────────────────────────────────────
        case "checkout.session.expired": {
            const session = event.data.object;

            const payment = await prisma.payment.findUnique({
                where: { stripeSessionId: session.id },
            });

            if (!payment) {
                console.error(`No payment found for session ${session.id}`);
                break;
            }

            await prisma.payment.update({
                where: { stripeSessionId: session.id },
                data: {
                    stripeEventId: event.id,
                    status: PaymentStatus.FAILED,
                },
            });

            console.log(
                `checkout.session.expired → payment ${payment.id} marked FAILED`,
            );
            break;
        }

        // ── Payment Intent Failed ────────────────────────────────────────────
        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;

            const payment = await prisma.payment.findFirst({
                where: { stripePaymentIntentId: paymentIntent.id },
            });

            if (!payment) {
                console.error(
                    `No payment found for payment_intent ${paymentIntent.id}`,
                );
                break;
            }

            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    stripeEventId: event.id,
                    status: PaymentStatus.FAILED,
                },
            });

            console.log(
                `payment_intent.payment_failed → payment ${payment.id} marked FAILED`,
            );
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return { message: `Webhook event ${event.id} processed successfully` };
};

// ─── Refund ────────────────────────────────────────────────────────────────

const refundPayment = async (bookingId: string, user: IRequestUser) => {
    const studentData = await prisma.user.findUniqueOrThrow({
        where: { email: user.email },
    });

    const payment = await prisma.payment.findUniqueOrThrow({
        where: {
            bookingId,
            studentId: studentData.id,
        },
    });

    if (payment.status !== PaymentStatus.SUCCEEDED) {
        throw new Error("Only succeeded payments can be refunded");
    }

    if (!payment.stripePaymentIntentId) {
        throw new Error("No Stripe payment intent found for this payment");
    }

    await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
    });

    await prisma.$transaction(async (tx) => {
        await tx.payment.update({
            where: { bookingId },
            data: { status: PaymentStatus.REFUNDED },
        });

        await tx.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.CANCELLED },
        });
    });

    console.log(`Refund issued for booking ${bookingId}`);

    return { success: true };
};

// ─── Export ────────────────────────────────────────────────────────────────

export const PaymentService = {
    createCheckoutSession,
    handlerStripeWebhookEvent,
    refundPayment,
};

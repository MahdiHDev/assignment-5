import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createBookingSchema = z
    .object({
        sessionDate: z.iso.date({
            error: (issue) =>
                issue.input === undefined
                    ? "Session date is required"
                    : "sessionDate must be a valid date (YYYY-MM-DD)",
        }),
        startTime: z
            .string({ error: "Start time is required" })
            .regex(timeRegex, "Invalid time format. Use HH:MM"),
        endTime: z
            .string({ error: "End time is required" })
            .regex(timeRegex, "Invalid time format. Use HH:MM"),
        tutorCategoryId: z
            .string({ error: "Tutor category is required" })
            .min(1, "Tutor category is required"),
    })
    .refine((data) => data.startTime < data.endTime, {
        message: "Start time must be before end time",
        path: ["endTime"],
    })
    .refine(
        (data) => {
            const sessionDate = new Date(`${data.sessionDate}T00:00:00.000Z`);
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            return sessionDate >= today;
        },
        {
            message: "Session date cannot be in the past",
            path: ["sessionDate"],
        },
    );

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

import { BookingStatus } from "../../generated/enums"; // adjust path to match your project

export const bookingStatusSchema = z.object({
    status: z.enum(BookingStatus, {
        error: `Invalid status. Status must be one of: ${Object.values(BookingStatus).join(", ")}`,
    }),
    meetingLink: z.url("meetingLink must be a valid URL").optional(),
});

export type BookingStatusInput = z.infer<typeof bookingStatusSchema>;

import { z } from "zod";
import { DayOfWeek } from "../../generated/enums";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const slotSchema = z
    .object({
        dayOfWeek: z.enum(DayOfWeek, {
            error: `dayOfWeek must be one of: ${Object.values(DayOfWeek).join(", ")}`,
        }),
        startTime: z
            .string()
            .regex(
                timeRegex,
                "Invalid time format. Use HH:MM (24-hour format)",
            ),
        endTime: z
            .string()
            .regex(
                timeRegex,
                "Invalid time format. Use HH:MM (24-hour format)",
            ),
    })
    .refine((slot) => slot.startTime < slot.endTime, {
        message: "Start time must be before end time",
        path: ["endTime"],
    });

export const createAvailabilitySchema = z
    .object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        slots: z.array(slotSchema).min(1, "At least one slot is required"),
    })
    .refine((data) => data.startDate < data.endDate, {
        message: "Invalid date range",
        path: ["endDate"],
    });

export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>;

export const updateAvailabilitySchema = z
    .object({
        dayOfWeek: z
            .enum(DayOfWeek, {
                error: `dayOfWeek must be one of: ${Object.values(DayOfWeek).join(", ")}`,
            })
            .optional(),
        startTime: z
            .string()
            .regex(timeRegex, "Invalid time format. Use HH:MM (24-hour format)")
            .optional(),
        endTime: z
            .string()
            .regex(timeRegex, "Invalid time format. Use HH:MM (24-hour format)")
            .optional(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
    })
    .refine(
        (data) =>
            !data.startTime || !data.endTime || data.startTime < data.endTime,
        { message: "Start time must be before end time", path: ["endTime"] },
    )
    .refine(
        (data) =>
            !data.startDate || !data.endDate || data.startDate < data.endDate,
        { message: "Invalid date range", path: ["endDate"] },
    );

export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;

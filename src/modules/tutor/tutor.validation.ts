import { z } from "zod";
import { TutorLevel } from "../../generated/enums";

export const createTeachingSessionSchema = z.object({
    subjectName: z
        .string({ error: "Subject name is required" })
        .trim()
        .min(1, "Subject name is required")
        .max(100, "Subject name must be under 100 characters"),
    hourlyRate: z
        .number({ error: "Hourly rate is required" })
        .positive("Hourly rate must be greater than 0"),
    experienceYears: z
        .number({ error: "Experience years is required" })
        .int("Experience years must be a whole number")
        .min(0, "Experience years cannot be negative"),
    level: z.enum(TutorLevel, {
        error: `Level must be one of: ${Object.values(TutorLevel).join(", ")}`,
    }),
    bio: z.string().max(2000, "Bio must be under 2000 characters").optional(),
    isPrimary: z.boolean().optional(),
});

export type CreateTeachingSessionInput = z.infer<
    typeof createTeachingSessionSchema
>;

export const updateTeachingSessionSchema = z
    .object({
        hourlyRate: z
            .number()
            .positive("Hourly rate must be greater than 0")
            .optional(),
        experienceYears: z
            .number()
            .int("Experience years must be a whole number")
            .min(0, "Experience years cannot be negative")
            .optional(),
        level: z
            .enum(TutorLevel, {
                error: `Level must be one of: ${Object.values(TutorLevel).join(", ")}`,
            })
            .optional(),
        description: z
            .string()
            .max(2000, "Description must be under 2000 characters")
            .optional(),
        isPrimary: z.boolean().optional(),
    })
    .refine((data) => Object.values(data).some((v) => v !== undefined), {
        message: "At least one field must be provided",
        path: ["_general"],
    });

export type UpdateTeachingSessionInput = z.infer<
    typeof updateTeachingSessionSchema
>;

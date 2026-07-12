import { z } from "zod";

export const createReviewSchema = z.object({
    bookingId: z.string().min(1, "bookingId is required"),
    rating: z
        .number({ error: "Rating is required" })
        .int("Rating must be a whole number")
        .min(1, "Rating must be between 1 and 5")
        .max(5, "Rating must be between 1 and 5"),
    comment: z
        .string()
        .max(1000, "Comment must be under 1000 characters")
        .optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

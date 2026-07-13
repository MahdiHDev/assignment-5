import { z } from "zod";

const registerUserSchema = z.object({
    name: z
        .string({ error: "Name is required" })
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must not exceed 100 characters")
        .trim(),
    email: z
        .string({ error: "Email is required" })
        .email("Invalid email address")
        .trim()
        .toLowerCase(),
    password: z
        .string({ error: "Password is required" })
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must not exceed 128 characters"),
});

const loginUserSchema = z.object({
    email: z
        .string({ error: "Email is required" })
        .email("Invalid email address")
        .trim()
        .toLowerCase(),
    password: z
        .string({ error: "Password is required" })
        .min(1, "Password is required"),
});

const changePasswordSchema = z
    .object({
        currentPassword: z
            .string({ error: "Current password is required" })
            .min(1, "Current password is required"),
        newPassword: z
            .string({ error: "New password is required" })
            .min(8, "New password must be at least 8 characters")
            .max(128, "New password must not exceed 128 characters"),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "New password must be different from current password",
        path: ["newPassword"],
    });

const verifyEmailSchema = z.object({
    email: z
        .string({ error: "Email is required" })
        .email("Invalid email address")
        .trim()
        .toLowerCase(),
    otp: z
        .string({ error: "OTP is required" })
        .length(6, "OTP must be 6 digits")
        .regex(/^\d+$/, "OTP must contain only digits"),
});

const resetPasswordSchema = z.object({
    email: z
        .string({ error: "Email is required" })
        .email("Invalid email address")
        .trim()
        .toLowerCase(),
    otp: z
        .string({ error: "OTP is required" })
        .length(6, "OTP must be 6 digits")
        .regex(/^\d+$/, "OTP must contain only digits"),
    newPassword: z
        .string({ error: "New password is required" })
        .min(8, "New password must be at least 8 characters")
        .max(128, "New password must not exceed 128 characters"),
});

export const authValidation = {
    registerUserSchema,
    loginUserSchema,
    changePasswordSchema,
    verifyEmailSchema,
    resetPasswordSchema,
};

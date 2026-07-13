import { NextFunction, Request, Response } from "express";
import { tokenUtils } from "../../utils/token";
import { AuthService } from "./auth.service";

const registerUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await AuthService.registerUser(req.body);

        const { accessToken, refreshToken, token, ...rest } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token as string);

        res.status(201).json({
            success: true,
            message: "User registered successfully!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AuthService.loginUser(req.body);
        const { accessToken, refreshToken, token, ...rest } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token);

        res.status(200).json({
            success: true,
            message: "User Logged In Successfully!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getNewToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];

        if (!refreshToken) {
            throw new Error("Refresh token is missing");
        }

        const result = await AuthService.getNewToken(
            refreshToken,
            betterAuthSessionToken,
        );

        const {
            accessToken,
            refreshToken: newRefreshToken,
            sessionToken,
        } = result;

        res.status(200).json({
            success: true,
            message: "New tokens generated successfully!",
            data: {
                accessToken,
                refreshToken: newRefreshToken,
                sessionToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const payload = req.body;
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];

        const result = await AuthService.changePassword(
            payload,
            betterAuthSessionToken,
        );

        res.status(200).json({
            success: true,
            message: "Password changed successfully!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];

        const result = await AuthService.logoutUser(betterAuthSessionToken);

        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        res.clearCookie("better-auth.session_token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });

        res.status(200).json({
            success: true,
            message: "User logged out successfully!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body;

        await AuthService.verifyEmail({ email, otp });

        res.status(200).json({
            success: true,
            message: "Email verified successfully!",
        });
    } catch (error) {
        next(error);
    }
};

const forgetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { email } = req.body;

        await AuthService.forgetPassword(email);

        res.status(200).json({
            success: true,
            message: "Password reset OTP sent to email successfully!",
        });
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { email, otp, newPassword } = req.body;

        await AuthService.resetPassword({ email, otp, newPassword });

        res.status(200).json({
            success: true,
            message: "Password reset successfully!",
        });
    } catch (error) {
        next(error);
    }
};

export const AuthController = {
    registerUser,
    loginUser,
    getNewToken,
    changePassword,
    logoutUser,
    verifyEmail,
    forgetPassword,
    resetPassword,
};

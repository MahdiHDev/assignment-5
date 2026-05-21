import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from "../../lib/auth";

export enum UserRole {
    STUDENT = "STUDENT",
    ADMIN = "ADMIN",
    TUTOR = "TUTOR",
}

export const checkAuth =
    (...roles: UserRole[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // ======================= VERIFY COOKIE =======================
            //Session Token Verification
            const sessionToken =
                req.cookies["__Secure-session_token"] ||
                req.cookies["session_token"];
            if (!sessionToken) {
                throw new Error(
                    "Unauthorized access! No session token provided.",
                );
            }

            // ======================= VERIFY USER ACCESS AND OTHERS =======================
            const session = await betterAuth.api.getSession({
                headers: req.headers as any,
            });

            if (!session) {
                return res.status(401).json({
                    success: false,
                    message: "You are not authorized!",
                });
            }

            if (!session.user.emailVerified) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Email verification required. Please verify your email",
                });
            }

            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role as string,
                emailVerified: session.user.emailVerified,
            };

            if (roles.length && !roles.includes(req.user.role as UserRole)) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Forbidden! You don't have permission to access this resource",
                });
            }

            next();
        } catch (error: any) {
            next(error);
        }
    };

export default checkAuth;

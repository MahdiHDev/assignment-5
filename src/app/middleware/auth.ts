import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { CookieUtils } from "../../utils/cookie";
import { jwtUtils } from "../../utils/jwt";

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
                req.cookies["session_token"] ||
                req.cookies["better-auth.session_token"] ||
                (req.headers["x-session-token"] as string | undefined);
            if (!sessionToken) {
                throw new Error(
                    "Unauthorized access! No session token provided.",
                );
            }

            // ======================= VERIFY USER ACCESS AND OTHERS =======================
            const session = await prisma.session.findFirst({
                where: {
                    token: sessionToken,
                    expiresAt: {
                        gt: new Date(),
                    },
                },
                include: {
                    user: true,
                },
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

            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Forbidden! You don't have permission to access this resource",
                });
            }

            // Access Token Verification
            const bearerHeader = req.headers.authorization;
            const bearerToken = bearerHeader?.startsWith("Bearer ")
                ? bearerHeader.split(" ")[1]
                : undefined;

            const accessToken =
                CookieUtils.getCookie(req, "accessToken") || bearerToken;

            if (!accessToken) {
                throw new Error(
                    "Unauthorized access! No access token provided.",
                );
            }

            const verifiedToken = jwtUtils.verifyToken(
                accessToken,
                process.env.ACCESS_TOKEN_SECRET!,
            );

            if (!verifiedToken.success) {
                throw new Error("Unauthorized access! Invalid access token.");
            }

            if (
                roles.length > 0 &&
                !roles.includes(verifiedToken.data!.role as UserRole)
            ) {
                throw new Error(
                    "Forbidden access! You do not have permission to access this resource.",
                );
            }

            next();
        } catch (error: any) {
            next(error);
        }
    };

export default checkAuth;

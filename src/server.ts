import app from "./app";
import { prisma } from "./lib/prisma";

const bootstrap = async () => {
    try {
        await prisma.$connect();
        app.listen(process.env.PORT || 5000, () => {
            console.log(
                `Server is running on http://localhost:${process.env.PORT}`,
            );
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
};
// ✅ Only listen locally — Vercel uses export default
if (process.env.NODE_ENV !== "production") {
    bootstrap();
}

export default app;

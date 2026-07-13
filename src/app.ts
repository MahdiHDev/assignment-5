import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import path from "path";
import qs from "qs";
import errorHandler from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import userRouter from "./app/modules/user/user.router";
import { PaymentController } from "./modules/payment/payment.controller";
import routes from "./routes";

const app: Application = express();
app.set("query parser", (str: string) => qs.parse(str));

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    PaymentController.handleStripeWebhookEvent, // rename from handleStripeWebhookEvent
);

app.use(cookieParser());
app.use(
    cors({
        origin:
            process.env.NODE_ENV === "development"
                ? "http://localhost:3000"
                : process.env.FRONTEND_URL,
        credentials: true,
        // methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        // allowedHeaders: [["Content-Type", "Authorization", "Cookie"],
    }),
);

// Bettr auth hander
// app.use("/api/auth", toNodeHandler(auth));

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

// ========================== Connect Routes ==========================
// app.use("/api/v1", IndexRoutes);
app.use("/api/v1", routes);
app.use("/api/v1/users", userRouter);

// Basic route
app.get("/", async (req: Request, res: Response) => {
    res.status(201).json({
        success: true,
        message: "SkillBridge- Online Tutor Platform",
    });
});

// ======================== Global Error Handler / Not Found Handler / Other Middleware ========================
app.use(errorHandler);
app.use(notFound);

export default app;

// dont use corn, multer, socket.io etc (scheduler, file uploader, socket)

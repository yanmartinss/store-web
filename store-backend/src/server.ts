import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import "dotenv/config";
import { routes } from "./routes/main.js";
import { apiLimiter } from "./middleware/rate-limit.js";

const server = express();
server.use(
  helmet({
    // media is served for embedding in the frontend, which runs on a
    // different origin (port) in dev, so it must not be same-origin only
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
server.use(
  cors({
    origin: process.env.FRONT_END_URL,
    credentials: true,
  }),
);
server.use(cookieParser());
server.use(express.static("public"));

server.use("/api/webhook/stripe", express.raw({ type: "application/json" }));

server.use(express.json());
server.use("/api", apiLimiter, routes);

server.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  return res.status(500).json({ message: "Internal Server Error" });
});

server.listen(process.env.PORT || 8080, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 8080}`);
});

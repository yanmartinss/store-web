import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";

import "dotenv/config";
import { routes } from "./routes/main.js";

const server = express();
server.use(cors());
server.use(express.static("public"));

server.use("/api/webhook/stripe", express.raw({ type: "application/json" }));

server.use(express.json());
server.use("/api", routes);

server.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  return res.status(500).json({ message: "Internal Server Error" });
});

server.listen(process.env.PORT || 8080, () => {
  console.log(
    `Server running on http://192.168.1.12:${process.env.PORT || 8080}`,
  );
});

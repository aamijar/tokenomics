import express from "express";
import cors from "cors";
import morgan from "morgan";
import pinoHttp from "pino-http";
import pino from "pino";
import dotenv from "dotenv";
import { router as api } from "./routes/api.js";

dotenv.config();

const app = express();
const logger = pino({ level: "info" });

app.use(pinoHttp({ logger }));
app.use(morgan("tiny"));
app.use(express.json());

const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: corsOrigin }));

app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/api", api);

const port = process.env.PORT || 8787;
app.listen(port, () => {
  logger.info({ port }, "server listening");
});

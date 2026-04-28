import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import dbConnect from "./utils/dbConnect.js";
import cors from "cors";

import { coursesRouter, } from "./routes/coursesRoute.js";
import { facultyRouter, } from "./routes/facultyRoute.js";
import { roomsRouter, } from "./routes/roomsRoute.js";
import { timetablesRouter, } from "./routes/timetableRoute.js";
import { aiRouter, } from "./routes/aiRoute.js";
import { notificationsRouter, } from "./routes/notificationsRoute.js";

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_URL || process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json({ limit: "1mb" }));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked request from origin: ${origin}`));
    },
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  res.json({
    name: "Smart Classroom API",
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
  });
});

const databasePaths = ["/api/courses", "/api/faculty", "/api/rooms", "/api/timetables", "/api/notifications"]

app.use((req, res, next) => {
  const requiresDatabase = databasePaths.some((path) => req.path.startsWith(path))
  const isConnected = mongoose.connection.readyState === 1

  if (requiresDatabase && !isConnected) {
    return res.status(503).json({
      error:
        "Database is not connected. Update backend/.env with a valid MONGO_URI or start a local MongoDB instance.",
    })
  }

  next()
})

app.use("/api/courses", coursesRouter);
app.use("/api/faculty", facultyRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/timetables", timetablesRouter);
app.use("/api/ai", aiRouter);
app.use("/api/notifications", notificationsRouter);

const startServer = async () => {
  await dbConnect();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Fatal server startup error:", error);
  process.exit(1);
});

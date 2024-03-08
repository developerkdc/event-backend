// admin-panel/server.js
import { config } from "dotenv";
config();
import express from "express";
import http from "http";
import expressGroupRoutes from "express-group-routes";
import mongo_service from "./database/mongo.service.js";
mongo_service();
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

//  Admin Routes imports
import authRouter from "./routes/Admin/auth.routes.js";
import usersRouter from "./routes/Admin/user.routes.js";
import guestRouter from "./routes/Admin/guest.routes.js";

// member routes import
import vendorRouter from "./routes/Vendor/guest.routes.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { globalErrorHandler } from "./Utils/GlobalErrorHandler.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.json());
var corsOptions = {
  origin: ["http://localhost:3001"],
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("./uploads"));
app.use(express.static(__dirname));
app.use(cookieParser());

// Use the socket.io module
// socketIoModule(server);

app.group("/api/v1/admin", (router) => {
  router.use("/auth", authRouter);
  router.use("/user", usersRouter);
  router.use("/guest", guestRouter);
});
app.group("/api/v1/vendor", (router) => {
  router.use("/guest", vendorRouter);
});

app.use(globalErrorHandler);

// Error handling for the server

app.listen(PORT, () => {
  console.log(`Admin Panel Server listening on port ${PORT}`);
});

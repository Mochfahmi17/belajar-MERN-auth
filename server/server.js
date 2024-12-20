import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = ["http://localhost:5173"];

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

//* API Enpoints
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server up and running at http://localhost:${port}`);
  });
});

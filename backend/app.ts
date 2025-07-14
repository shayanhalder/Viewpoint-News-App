
import { getTrendingTopics } from "./services/topics";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import newsRouter from "./routes/news";
import newsDate from "./models/newsDate";
import dotenv from "dotenv";

dotenv.config(); // load env variables
const PORT = process.env.PORT;
const MONGODB_KEY = process.env.MONGODB_KEY || "mongodb://localhost:27017/newsdb"; // default to local MongoDB if not set

const app = express();
app.use(express.json());
app.use(cors());
app.use("/history", newsRouter);

// Connect to MongoDB Database
mongoose.connect(
  MONGODB_KEY
);

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

app.get("/", (req, res) => {
    res.send("News API Server is online");
});

// Returns trending topics in an array to the client
app.get("/trending", async (req, res) => {
  const output = await getTrendingTopics();
  res.send(output);
});

// returns the current news data for today
app.get("/current", async (req, res) => {
  try {
    const news = await newsDate.findOne().sort({ date: -1, time: -1 }); // removeMissingNewsData(news); // make sure no "null values"
    res.json(news);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

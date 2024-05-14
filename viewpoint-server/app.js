import { formatDate, removeMissingNewsData } from "./dataFormatting.js";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import nodeCron from "node-cron";
import NewsDate from "./models/newsdate.js";
import newsRouter from "./routes/news.js";
import currentNews from "./models/currentnews.js";
import { getTopics, fetchPastData, fetchCurrentData } from "./dataRetrieval.js";
import dotenv from "dotenv";

// const { v1: uuidv1 } = require('uuid');
const fetch = (
  ...args // fetch API for node.js
) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

dotenv.config(); // load env variables
const PORT = process.env.PORT;

const app = express();
app.use(express.json());
app.use(cors());
app.use("/history", newsRouter);

// Connect to MongoDB Database
mongoose.connect(
  process.env.MONGODB_KEY,
  {
    useNewUrlParser: true
  }
);

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

// Returns trending topics in an array to the client
app.get("/trending", async (req, res) => {
  const output = await getTopics();
  res.send(output);
});

// returns the current news data for today
app.get("/current", async (req, res) => {
  try {
    const news = await currentNews.find();
    removeMissingNewsData(news); // make sure no "null values"
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/get-analysis", async (req, res) => {
  const requestBody = JSON.stringify({
    trending_topic: req.body.trending,
    body: req.body.text,
  });

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: requestBody,
  };
  const promise = await fetch("https://viewpoint-python-gpt-server.onrender.com/get-analysis", options);
  let analysis;
  try {
    analysis = await promise.json();
  } catch (err) {
    console.log(err);
  }

  console.log(analysis);

  res.json(analysis);
});

export async function updatePastData() {
  /* Updates the MongoDB database with the trending topics at the end of a given day
     and past news data about the trending topics from a variety of news sources on both left 
     and right-wing media. */

  console.log("Starting past news database updater scheduled task:");
  const trendingTopics = await getTopics();
  const todayDate = formatDate(new Date(), true, 1);
  const pastDate = formatDate(new Date(), true, 3);
  // go 3 days in advance since sometimes no news data available for a 24 hr period, or none available at all

  const pastNewsData = await fetchPastData(trendingTopics, todayDate, pastDate);
  const usedTrendingTopics = Object.keys(pastNewsData);

  console.log("Past news data object:");
  console.log(pastNewsData);

  console.log("Used trending topics");
  console.log(usedTrendingTopics);

  const uploadObject = new NewsDate({
    date: todayDate,
    trending: usedTrendingTopics,
    news: pastNewsData,
  });

  try {
    const newNews = await uploadObject.save();
    console.log("Successfully updated database with past news data: ", newNews);
  } catch (err) {
    console.log({ message: err.message });
    return { message: err.message };
  }

  return pastNewsData;
}

export async function updatePresentData() {
  /* Updates the MongoDB database with the current trending topics and top stories about the 
    trending topics from a variety of news sources on both left and right-wing media. */

  try {
    console.log("Starting current news data database updater: ");
    let allTrendingTopics = await getTopics(); // webscrape current trending news topics
    let newsObject = await fetchCurrentData(allTrendingTopics); // request news API with trending topics to get current news data
    // some trending topics may have no stories (due to news API technicalities), so fetchCurrentData removes those trending topics.
    const usedTrendingTopics = Object.keys(newsObject); // all of the trending topics that actually have news data associated with them

    let current = await currentNews.find(); // get mongoose schema to update database

    // update current news with the new data on MongoDB database
    current[0].updateOne({ trending: usedTrendingTopics, news: newsObject }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully updated database with present data. Result: ", result);
      }
    });

    return newsObject;
  } catch (err) {
    console.log(err);
    return { message: err };
  }
}

// nodeCron database automation schedulers

// Automate database updating
const pastDataUpdater = nodeCron.schedule("0 30 23 * * *", async () => {
  const pastData = await updatePastData();
  console.log("Databse updated with the following past news data: ", pastData);
});

// Automated Task to Update the Current News Data at the start of the day
const presentDataMorningUpdater = nodeCron.schedule("0 30 10 * * *", async () => {
  const presentData = await updatePresentData();
  console.log("Database updated with the following current news data: ", presentData);
});

const presentDataEveningUpdater = nodeCron.schedule("0 36 20 * * *", async () => {
  console.log("Starting evening data scheduled task: ");
  const presentData = await updatePresentData();
  console.log("Database updated with the following current news data: ", presentData);
});

// Endpoints with NodeCron schedulers for manual testing and debugging-- not meant to be used from React-frontend.
app.get("/updatePastData", async (req, res) => {
  const pastNewsData = await updatePastData(req, res);
  res.json(pastNewsData);
});

app.get("/updatePresentData", async (req, res) => {
  const presentData = await updatePresentData(req, res);
  res.json(presentData);
});

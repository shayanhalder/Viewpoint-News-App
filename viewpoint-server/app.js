import { formatDate, removeMissingNewsData } from "./dataRetrieval/dateFormatting.js";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import NewsDate from "./models/newsdate.js";
import newsRouter from "./routes/news.js";
import currentNews from "./models/currentnews.js";
import { getTopics, fetchPastData, fetchCurrentData } from "./dataRetrieval/main.js";
import dotenv from "dotenv";

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

/* Updates the MongoDB database with the trending topics at the end of a given day
     and past news data about the trending topics from a variety of news sources on both left 
     and right-wing media. */
export async function updatePastData() {
  console.log("Starting past news database updater scheduled task:");
  const trendingTopics = await getTopics();
  const todayDate = formatDate(new Date(), past = 1); // one day in advance since for some reason on the backend web hosting if you don't do this it goes one day in advance
  const pastDate = formatDate(new Date(), past = 3); // go 3 days in advance since sometimes no news data available for a 24 hr period, or none available at all

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


/* Updates the MongoDB database with the current trending topics and top stories about the 
trending topics from a variety of news sources on both left and right-wing media. */

export async function updatePresentData() {
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


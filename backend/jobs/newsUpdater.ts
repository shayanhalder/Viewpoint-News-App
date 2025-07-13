import { getTrendingTopics } from "../services/topics";
import { fetchCurrentData } from "../services/news";
import { formatDate } from "../services/date";
import NewsDate from "../models/newsDate";
import mongoose from "mongoose";
import dotenv from "dotenv";

async function updateNewsData() {
  try {
    console.log("Starting news data database job... ");
    console.log("Current time:", new Date().toISOString());

    let allTrendingTopics = await getTrendingTopics(); // webscrape current trending news topics
    console.log("All trending topics: ", allTrendingTopics);

    let newsObject = await fetchCurrentData(allTrendingTopics); // request news API with trending topics to get current news data
    const usedTrendingTopics = Object.keys(newsObject); // all of the trending topics that actually have news data associated with them

    const todayDate = formatDate(new Date(), 0);
    const uploadObject = new NewsDate({
      date: todayDate,
      time: new Date().toISOString().substring(11, 16), // "HH:MM" in UTC
      trending: usedTrendingTopics,
      news: newsObject,
    });
    
    try {
      const newNews = await uploadObject.save();
      console.log("Successfully updated database with past news data: \n", newNews);
    } catch (err: any) {
      console.log({ message: `[29] ${err.message}` });
      return { message: `[30] ${err.message}` };
    }

    return newsObject;
    
  } catch (err: any) {
      console.log(`[36] ${err.message}`);
      return { message: `[37] ${err.message}` };
  }
}

if (require.main === module) { // only run when this file is executed directly 
    dotenv.config(); // load environment variables from .env file
    const MONGODB_KEY = process.env.MONGODB_KEY || "mongodb://localhost:27017/newsdb"; // replace with your MongoDB connection string
    mongoose.connect(MONGODB_KEY);
    const db = mongoose.connection;
    db.once("open", async () => {
      console.log("Connected to database");
      await updateNewsData();
      process.exit(0); // exit after running the job
    }); 
    
}



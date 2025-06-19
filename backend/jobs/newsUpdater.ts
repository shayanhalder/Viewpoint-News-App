import { getTrendingTopics } from "../services/topics";
import { fetchCurrentData } from "../services/news";
import { formatDate } from "../services/date";
import NewsDate from "../models/newsdate.js";

async function updateNewsData() {
  try {
    console.log("Starting news data database job... ");
    console.log("Current time:", new Date().toISOString());

    let allTrendingTopics = await getTrendingTopics(); // webscrape current trending news topics
    let newsObject = await fetchCurrentData(allTrendingTopics); // request news API with trending topics to get current news data
    const usedTrendingTopics = Object.keys(newsObject); // all of the trending topics that actually have news data associated with them

    const todayDate = formatDate(new Date(), 0);
    const uploadObject = new NewsDate({
      date: todayDate,
      trending: usedTrendingTopics,
      news: newsObject,
    });
    
    try {
      const newNews = await uploadObject.save();
      console.log("Successfully updated database with past news data: \n", newNews);
    } catch (err: any) {
      console.log({ message: err.message });
      return { message: err.message };
    }

    return newsObject;
    
  } catch (err: any) {
      console.log(err);
      return { message: err };
  }
}

if (require.main === module) { // only run when this file is executed directly 
    updateNewsData();
}



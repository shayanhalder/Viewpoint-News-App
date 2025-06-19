import { getTrendingTopics } from "../services/topics";
import { fetchCurrentData } from "../services/news";
import currentNews from "../models/news";

async function updatePresentData() {
  try {
    console.log("Starting news data database job... ");
    console.log("Current time:", new Date().toISOString());

    let allTrendingTopics = await getTrendingTopics(); // webscrape current trending news topics
    let newsObject = await fetchCurrentData(allTrendingTopics); // request news API with trending topics to get current news data
    // some trending topics may have no stories (due to news API technicalities), so fetchCurrentData removes those trending topics.
    const usedTrendingTopics = Object.keys(newsObject); // all of the trending topics that actually have news data associated with them

    let current = await currentNews.find(); // get mongoose schema to update database

    // update current news with the new data on MongoDB database
    current[0].updateOne({ trending: usedTrendingTopics, news: newsObject }, (err: string, result: string) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully updated database with present data.\nResult: ", result);
      }
    });

    return newsObject;
  } catch (err) {
    console.log(err);
    return { message: err };
  }
}

if (require.main === module) { // only run when this file is executed directly 
    updatePresentData();
}



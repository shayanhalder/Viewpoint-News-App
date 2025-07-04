import { newsAPIResponse, newsData } from "../types/types";
import { maximizeNewsDiversity } from "./newsSorting";
import { sourceURLMap } from "./newsSorting";
import dotenv from "dotenv";

/** Helper function to get past news data given a topic, potential sources to search for, and time frame.
 * @param {string} topic - Trending topic that you want news data about
 * @param {string} sources - A string of all news sources to use when looking for the news data. 
 * @param {string} startDate - Furthest date in the search timeframe.
 * @param {string} endDate - Most recent date in the search timeframe.
* @returns {Object} Past news data for given timeframe.
*/
dotenv.config();
const NEWS_API_KEYS = [process.env.NEWS_API_KEY1, process.env.NEWS_API_KEY2, process.env.NEWS_API_KEY3,
  process.env.NEWS_API_KEY4, process.env.NEWS_API_KEY5,
  process.env.NEWS_API_KEY6, process.env.NEWS_API_KEY7,
  process.env.NEWS_API_KEY8, process.env.NEWS_API_KEY9,
  process.env.NEWS_API_KEY10];

async function requestPastNewsData( topic: string, sources: string, startDate: string, endDate: string ) : Promise<newsAPIResponse | null> {
  const pastDataURL = `https://newsapi.org/v2/everything?q=${topic}&domains=${sources}&sortBy=relevancy
                        &from=${startDate}&to=${endDate}`;
  // NOTE: when searching for past news in a timeframe with the news API, the search results tend to be better if
  // the potential sources are given all as one string.    
  let response;
  try {
    response = await makeShuffledAPIKeyRequest(pastDataURL);
  } catch (err) {
    console.log(err);
    return null;
  }

  return response;
}


/**
 * Given an array of trending topics, it returns an object with all the left and right-wing news data 
 * associated with each trending topic in a given time frame in the past, with news diversity maximized.
 * @param {Array<string>} trendingTopics - An array of currently trending topics that were webscraped.
 * @param {string} date - The end date of the time frame to search for.
 * @param {string} previousDate - The start date of the time frame to search for.
 * @returns {Object} - Left and right-wing news data for each trending topic.
 * Example return value: 
 */

export async function fetchPastData( trendingTopics : string[], date: string, previousDate: string) : Promise<Record<string, { left: newsData[], right: newsData[] }>> {
  const pastNewsDataOutput : Record<string, { left: newsData[], right: newsData[] }> = {};

  const leftSources = "cnn.com,washingtonpost.com,nytimes.com,huffpost.com,vox.com,msnbc.com";
  const rightSources =
    "foxnews.com,breitbart.com,theblaze.com,nypost.com,theepochtimes.com,washingtontimes.com";
  const sources = [leftSources, rightSources];

  for (const currentTrendingTopic of trendingTopics) {
    let leftBiasStories : newsData[] = []; // stores news from left-wing sources
    let rightBiasStories : newsData[] = []; // stores news from right-wing sources

    for (const currentSource of sources) { // for each trending topic, we will gather left and right-wing news sources
      let output = currentSource == leftSources ? leftBiasStories : rightBiasStories;
      const newsData = await requestPastNewsData( // use object to mimic keyword arguments
        currentTrendingTopic,
        currentSource,
        previousDate,
        date
      );

      if (!newsData?.articles || newsData.articles.length == 0) {
        break; // move onto next trending topic if no available news data
      }

      const [diverseNewsOutput] = maximizeNewsDiversity({ newsData: newsData });
      output.push(...diverseNewsOutput);
    }

    if (leftBiasStories.length == 0 || rightBiasStories.length == 0) {
      // if no news data available for a given source, discard it
      continue;
    }
    // otherwise add the data for the current trending topic to the pastNewsData object
    pastNewsDataOutput[currentTrendingTopic] = {
      left: leftBiasStories,
      right: rightBiasStories,
    };
  }

  return pastNewsDataOutput;
}

async function makeShuffledAPIKeyRequest(url: string) : Promise<newsAPIResponse | null> {
  // Shuffle the API keys to make requests with different keys
  for (const key of NEWS_API_KEYS) {
    try {
      const response = await fetch(`${url}&apiKey=${key}`);
      if (!response.ok) {
        continue;
      }
      return await response.json();
    } catch (error) {
      console.error(`Error with API key ${key}:`, error);
    }
  }
  return null; // If all requests fail, return null
}

/**
 * Helper function to get News API output for current news data given a topic and source(s).
 * @param {string} topic - The currently trending topic that we are searching news data for.
 * @param {string} source - The source(s) that we want the news data to come from (if multiple, separated by commas)
 * @returns {Object} - News data API output
 */
async function requestCurrentNewsData( topic: string, source: string ) : Promise<newsAPIResponse | null> {
  const currentDataURL = `https://newsapi.org/v2/everything?q=${topic}&domains=${source}&sortBy=relevancy`;
  let response : newsAPIResponse | null;
  try {
    response = await makeShuffledAPIKeyRequest(currentDataURL);
  } catch (err) {
    console.log("Error: ", err);
    return null;
  }
  return response;
}

/**
 * Given an array of trending topics, it returns an object with all the left and right-wing news data 
 * associated with each trending topic, with news diversity maximized.
 * @param {Array<string>} trendingTopics - An array of currently trending topics that were webscraped.
 * @returns {Object} - Left and right-wing news data for each trending topic.
 */
export async function fetchCurrentData(trendingTopics: string[]) : Promise<Record<string, { left: newsData[], right: newsData[] }>> {

  const leftSources = "cnn.com,washingtonpost.com,nytimes.com,huffpost.com,vox.com,msnbc.com";
  const rightSources =
    "foxnews.com,breitbart.com,theblaze.com,nypost.com,theepochtimes.com,washingtontimes.com";

  const sources : string[] = [leftSources, rightSources];
  let newsDataOutput : Record<string, {left: newsData[], right: newsData[]}> = {};

  for (const currentTrendingTopic of trendingTopics) {
    let leftBiasStories : newsData[] = [];
    let rightBiasStories : newsData[] = [];

    for (let source of sources) {
      let currentBiasStories = source == leftSources ? leftBiasStories : rightBiasStories;

      // first search for news data by grouping together all the news sources into one query
      const presentNewsData : newsAPIResponse | null = await requestCurrentNewsData(currentTrendingTopic, source);
      // if there were stories found from that query, then add them to output array, maximizing diversity
      let uniqueSourcesSeen : Set<string>;
      if (presentNewsData && presentNewsData.articles && presentNewsData.articles.length > 0) {
        const [newsOutput, uniqueSources] = maximizeNewsDiversity({ newsData: presentNewsData });
        uniqueSourcesSeen = uniqueSources;
        currentBiasStories.push(...newsOutput);
      } else {
        uniqueSourcesSeen = new Set();
      }

      const allSources = source.split(',');
      // sourcesToSearch are an array of sources that were not seen in the previous API output
      const sourcesToSearch = allSources.filter((source: string) => !uniqueSourcesSeen.has(sourceURLMap[source]));

      // We will make API calls for each of these individual sources we want to search to see if we can get
      // news stories from them that would not have appeared in the initial API calls with all the sources grouped together.

      for (const [index, singleSource] of sourcesToSearch.entries()) {
        const singleSourceNewsData = await requestCurrentNewsData(currentTrendingTopic, singleSource);
        if (singleSourceNewsData?.articles && singleSourceNewsData.articles.length > 0) {
          // if news story found, replace a source we have already seen in the output array with this source
          currentBiasStories.splice(uniqueSourcesSeen.size + index, 1, singleSourceNewsData.articles[0])
        }
      }

      // for each news story in the output array, calculate the sentiment score and add it as a field

    //   for (let story of currentBiasStories) {
    //     const currentURL = story.url;
    //     // const [sentimentScore, articleText] = await _getNewsSentimentScore(currentURL, sentimentAnalyzer);

    //     // add the sentiment analysis score and article text fields
    //     // story.sentimentScore = sentimentScore;
    //     // story.articleText = articleText;

    //   }
    }

    newsDataOutput[currentTrendingTopic] = { // add the news data associated with the current trending topic to the output
      left: leftBiasStories,
      right: rightBiasStories,
    };
  }

  removeEmptyNewsLists(newsDataOutput);
  return newsDataOutput;
}

/**
 * Removes any lists in the news data object that do not have any news data in them, which can happen from the News API output sometimes
 * @param {Object} newsData Output from news API query
 */
function removeEmptyNewsLists(newsData : Record<string, {left: newsData[], right: newsData[]}>) : void {
  for (let currentTrendingTopic of Object.keys(newsData)) {
    if (newsData[currentTrendingTopic].left.length == 0 || newsData[currentTrendingTopic].right.length == 0) {
      delete newsData[currentTrendingTopic];
    }
  }
}

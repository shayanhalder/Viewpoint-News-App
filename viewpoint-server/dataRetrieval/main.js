import axios from "axios";
import cheerio from "cheerio";
import dotenv from "dotenv";
import Sentiment from "sentiment";
import { sourceURLMap, maximizeNewsDiversity } from "./dataSorting.js";

dotenv.config(); // load env variables
const TOPICS_RETRIEVAL_URL = process.env.TOPICS_RETRIEVAL_URL;
let presentDataAPIKeyNumber = 2;
let PRESENT_DATA_API_KEY = process.env[`API_KEY${presentDataAPIKeyNumber}`];
const PAST_DATA_API_KEY = process.env.API_KEY11;

/** Gets the Trending Topics from ABC News by WebScrapping 
* @returns {Array} List of currently trending topics.
*/
export async function getTopics() {
  const topics = [];
  await axios(TOPICS_RETRIEVAL_URL)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html); // TODO: use updated version of Cheerio
      $(".subNav__text", html).each(function () { // .subNav__text class represents the elements with trending topic text
        let title = $(this).text();
        title = title.replace("Live Updates:", ""); // sometimes the website adds 'Live Updates' to the topic
        topics.push(title);
      });
    })
    .catch((err) => console.log(err));

  return topics.splice(0, 5); // take just the first 5 trending topics
}

/** Helper function to get past news data given a topic, potential sources to search for, and time frame.
 * @param {string} topic - Trending topic that you want news data about
 * @param {string} sources - A string of all news sources to use when looking for the news data. 
 * @param {string} startDate - Furthest date in the search timeframe.
 * @param {string} endDate - Most recent date in the search timeframe.
* @returns {Object} Past news data for given timeframe.
*/
async function requestPastNewsData({ topic, sources, startDate, endDate }) {
  const pastDataURL = new URL(`https://newsapi.org/v2/everything?q=${topic}&domains=${sources}&sortBy=relevancy
                        &from=${startDate}&to=${endDate}&apiKey=${PAST_DATA_API_KEY}`);
  // NOTE: when searching for past news in a timeframe with the news API, the search results tend to be better if
  // the potential sources are given all as one string.    
  const promise = await fetch(pastDataURL);
  const response = await promise.json();

  return response;
}

/**
 * Given an array of trending topics, it returns an object with all the left and right-wing news data 
 * associated with each trending topic in a given time frame in the past, with news diversity maximized.
 * @param {Array<string>} trendingTopics - An array of currently trending topics that were webscraped.
 * @param {string} date - The end date of the time frame to search for.
 * @param {string} previousDate - The start date of the time frame to search for.
 * @returns {Object} - Left and right-wing news data for each trending topic.
 */
export async function fetchPastData(trendingTopics, date, previousDate) {
  const pastNewsDataOutput = {};

  const leftSources = "cnn.com,washingtonpost.com,nytimes.com,huffpost.com,vox.com,msnbc.com";
  const rightSources =
    "foxnews.com,breitbart.com,theblaze.com,nypost.com,theepochtimes.com,washingtontimes.com";
  const sources = [leftSources, rightSources];

  for (const currentTrendingTopic of trendingTopics) {
    let leftBiasStories = []; // stores news from left-wing sources
    let rightBiasStories = []; // stores news from right-wing sources

    for (const currentSource of sources) { // for each trending topic, we will gather left and right-wing news sources
      let output = currentSource == leftSources ? leftBiasStories : rightBiasStories;
      const newsData = await requestPastNewsData({ // use object to mimic keyword arguments
        topic: currentTrendingTopic,
        sources: currentSource,
        startDate: previousDate,
        endDate: date
      });

      if (!newsData.articles || newsData.articles.length == 0) {
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

/**
 * Helper function to get News API output for current news data given a topic and source(s).
 * @param {string} topic - The currently trending topic that we are searching news data for.
 * @param {string} source - The source(s) that we want the news data to come from (if multiple, separated by commas)
 * @returns {Object} - News data API output
 */
async function requestCurrentNewsData(topic, source) {
  presentDataAPIKeyNumber = 5;
  let response;
  while (presentDataAPIKeyNumber <= 8) {
    PRESENT_DATA_API_KEY = process.env[`API_KEY${presentDataAPIKeyNumber}`];

    const currentDataURL = new URL(`https://newsapi.org/v2/everything?q=${topic}&domains=${source}&
                            sortBy=relevancy&apiKey=${PRESENT_DATA_API_KEY}`);

    const promise = await fetch(currentDataURL);
    response = await promise.json();

    if (response.code && response.code == "rateLimited") {
      presentDataAPIKeyNumber += 1; // try other API keys if current API key is rate limited
    } else if (response.status && response.status == "ok") {
      break;
    }
  }
  return response;
}

/**
 * Given an array of trending topics, it returns an object with all the left and right-wing news data 
 * associated with each trending topic, with news diversity maximized.
 * @param {Array<string>} trendingTopics - An array of currently trending topics that were webscraped.
 * @returns {Object} - Left and right-wing news data for each trending topic.
 */
export async function fetchCurrentData(trendingTopics) {

  const leftSources = "cnn.com,washingtonpost.com,nytimes.com,huffpost.com,vox.com,msnbc.com";
  const rightSources =
    "foxnews.com,breitbart.com,theblaze.com,nypost.com,theepochtimes.com,washingtontimes.com";

  const sources = [leftSources, rightSources];
  const sentimentAnalyzer = new Sentiment();

  let newsDataOutput = {};

  for (const currentTrendingTopic of trendingTopics) {
    let leftBiasStories = [];
    let rightBiasStories = [];

    for (let source of sources) {
      let currentBiasStories = source == leftSources ? leftBiasStories : rightBiasStories;

      // first search for news data by grouping together all the news sources into one query
      const presentNewsData = await requestCurrentNewsData(currentTrendingTopic, source);
      // if there were stories found from that query, then add them to output array, maximizing diversity
      let uniqueSourcesSeen;
      if (presentNewsData.articles && presentNewsData.articles.length > 0) {
        const [newsOutput, uniqueSources] = maximizeNewsDiversity({ newsData: presentNewsData });
        uniqueSourcesSeen = uniqueSources;
        console.log('unique sources seen: ', uniqueSourcesSeen)
        currentBiasStories.push(...newsOutput);
      } else {
        uniqueSourcesSeen = new Set();
      }

      const allSources = source.split(',');
      // sourcesToSearch are an array of sources that were not seen in the previous API output
      const sourcesToSearch = allSources.filter(source => !uniqueSourcesSeen.has(sourceURLMap[source]));
      console.log('sources to search: ')
      console.log(sourcesToSearch);

      // We will make API calls for each of these individual sources we want to search to see if we can get
      // news stories from them that would not have appeared in the initial API calls with all the sources grouped together.

      for (const [index, singleSource] of sourcesToSearch.entries()) {
        const singleSourceNewsData = await requestCurrentNewsData(currentTrendingTopic, singleSource);
        if (singleSourceNewsData.articles && singleSourceNewsData.articles.length > 0) {
          console.log('single source query added: ', singleSource)
          // if news story found, replace a source we have already seen in the output array with this source
          currentBiasStories.splice(uniqueSourcesSeen.size + index, 1, singleSourceNewsData.articles[0])
        }
      }

      // for each news story in the output array, calculate the sentiment score and add it as a field

      for (let story of currentBiasStories) {
        const currentURL = story.url;
        const [sentimentScore, articleText] = await _getNewsSentimentScore(currentURL, sentimentAnalyzer);

        // add the sentiment analysis score and article text fields
        story.sentimentScore = sentimentScore;
        story.articleText = articleText;

      }
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
 * Helper function to get the news sentiment score and text of a given news story using extractor API. 
 * @param {string} currentURL - URL of current news story we are trying to extract text from
 * @param {Sentiment()} sentiment - Sentment object to analyze the text
 * @returns {Array<string, string>} - Array of the sentiment score and text of the news story
 */
async function _getNewsSentimentScore(currentURL, sentiment) {
  let sentimentKeyNumber = 1;
  let data;
  while (sentimentKeyNumber <= 4) {
    const promise = await fetch(
      `https://extractorapi.com/api/v1/extractor/?apikey=${process.env[`SENTIMENT_KEY${sentimentKeyNumber}`]
      }&url=${currentURL}`
    );
    try {
      data = await promise.json();
    } catch (err) {
      console.log(err);
      sentimentKeyNumber += 1;
      continue;
    }

    if ("detail" in data && !("text" in data)) {
      // rate limit for current API key-- shuffle to next API key
      console.log("Extractor API Rate limited");
      sentimentKeyNumber += 1;
      continue;
    } else {
      // if valid data and API response, then stop shuffling API keys
      break;
    }
  }

  const text = data.text;
  const score = sentiment.analyze(text);

  delete score.tokens;
  delete score.words;
  delete score.calculation;

  return [score, text];
}

/**
 * Removes any lists in the news data object that do not have any news data in them, which can happen from the News API output sometimes
 * @param {Object} newsData Output from news API query
 */
function removeEmptyNewsLists(newsData) {
  for (let currentTrendingTopic of Object.keys(newsData)) {
    if (newsData[currentTrendingTopic].left.length == 0 || newsData[currentTrendingTopic].right.length == 0) {
      delete newsData[currentTrendingTopic];
    }
  }
}

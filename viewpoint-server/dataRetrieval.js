import axios from "axios";
import cheerio from "cheerio";
import { getAllIndexes } from "./dataFormatting.js";
import dotenv from "dotenv";
import Sentiment from "sentiment";

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
async function requestPastNewsData(topic, sources, startDate, endDate) {
  const pastDataURL = new URL(`https://newsapi.org/v2/everything?q=${topic}&domains=${sources}&sortBy=relevancy
                        &from=${startDate}&to=${endDate}&apiKey=${PAST_DATA_API_KEY}`);
  // NOTE: when searching for past news in a timeframe with the news API, the search results tend to be better if
  // the potential sources are given all as one string.    
  const promise = await fetch(pastDataURL);
  const response = await promise.json();

  return response;
}

function sortNewsSources(output, response) {
  /* Given the news API output, it returns an array of all unique sources encountered 
    (no repeats), as well as an array of all sources encountered during iteration 
    (including repeats). 
    
    Also adds news stories that only come from unique sources (no repeat sources) to 
    the "output" object which will contain the news data we upload to the MongoDB database. 
  */

  const uniqueSources = [];
  const allSources = [];

  for (let k = 0; k < response.articles.length; k++) {
    const tempSource = response.articles[k].source.name;
    allSources.push(tempSource);
    if (uniqueSources.includes(tempSource)) {
      continue; // do not add news from sources that we already have, so we have a variety of sources
    } else {
      uniqueSources.push(tempSource); // add the current news source name (eg. CNN/Fox News) to the array
      output.push(response.articles[k]);
    }
  }

  return [uniqueSources, allSources];
}

function getNewsStoryIndices(uniqueSources, allSources) {
  /* Returns a 2D array of indices representing the locations of each 
    news source encountered in the API response output, so they can be sorted
    and the diversity of news sources can be maximized. */

  const indexes = [];
  let maxColumns = 0;

  // add the indices of all the unique news sources (no repeat sources) to the indexes array
  for (let a = 0; a < uniqueSources.length; a++) {
    const arr = getAllIndexes(allSources, uniqueSources[a]);
    indexes.push(arr);
    if (arr.length > maxColumns) {
      maxColumns = arr.length;
    }
  }

  return [indexes, maxColumns];
}

function addRepeatSources(output, response, uniqueSources, allSources) {
  const [newsIndexesSortedBySource, maxColumns] = getNewsStoryIndices(uniqueSources, allSources);

  console.log("Indexes: ");
  console.log(newsIndexesSortedBySource);

  // iterate by column over the 2D array of indices and add news stories until we reach 5 total news stories
  /* Example: x
    newsIndexesSortedBySource = [ SHOULD BE INDICES INSTEAD OF WEBSITE SOURCES
      [0, 1, 2, 3, 5],
      [4, 6, 7, 8, 9],
      [10, 12, 14, 16],
      [11, 13, 15],
    ]

    First array represents the locations in the news API response where a given
    news source was enountered. For example, the first array can represent "cnn.com"
    and show that it was the first 4 news stories in the API response and the 5th story.
    
    Second array represents a different news source encountered in the news API response, 
    such as Fox News, and the numbers are the indices of where the source was encountered
    in the news API response data. 
    
    In order to maximize the diversity of news sources we use, we iterate vertically by column 
    through the 2D array, which will minimize the amount of repeat source that we use. 
  */

  iteration: for (let col = 0; col < maxColumns; col++) {
    for (let row = 0; row < newsIndexesSortedBySource.length; row++) {
      if (col + 1 > newsIndexesSortedBySource[row].length) {
        continue; // 2D array is not rectangular so some rows have less columns than others
      }
      const containsDuplicateNewsStory = output.some(
        (news) => news.title == response.articles[newsIndexesSortedBySource[row][col]].title
      );
      if (!containsDuplicateNewsStory) {
        // only add news stories we do not already have
        output.push(response.articles[newsIndexesSortedBySource[row][col]]);
        if (output.length >= 5) {
          // stop once we've reached 5 news stories
          break iteration;
        }
      }
    }
  }
}

/* Given a singular trending topic and range of dates, it returns the top stories from those dates
 on the topic. Queries news API with a string of all left/right news sources at once. 
 The news API tends to work better when all sources are passed in at once when searching for 
 past news stories, unlike when searching for current news stories where it does better 
 when provided with one news source at a time. Thus, there are separate functions for 
 obtaining past and present news data.  */

// export async function fetchPastData(topic, date, previousDate) {
export async function fetchPastData(trendingTopics, date, previousDate) {
  let pastNewsData = {};

  const leftSources = "cnn.com,washingtonpost.com,nytimes.com,huffpost.com,vox.com,msnbc.com,buzzfeed.com";
  const rightSources =
    "foxnews.com,breitbart.com,theblaze.com,nypost.com,theepochtimes.com,washingtontimes.com,dailywire.com";
  const sources = [leftSources, rightSources];

  for (let currentTrendingTopic of trendingTopics) {
    const leftOutput = []; // stores news from left-wing sources
    const rightOutput = []; // stores news from right-wing sources

    for (let source of sources) { // for each trending topic, we will gather left and right-wing news sources
      let output = source == leftSources ? leftOutput : rightOutput;
      let response = await requestPastNewsData(currentTrendingTopic, source, startDate = previousDate, endDate = date);

      console.log("past data news response: ");
      console.log(response);

      if (!response.articles || response.articles.length == 0) {
        continue; // move onto next source if no available news data
      }

      // adds only unique news source stories to "output" and returns an array of news sources without
      // duplicates and another array with all the news sources encountered in the API response data
      const [uniqueSources, allSources] = sortNewsSources(output, response);

      // if we have less than 5 news stories, then we'll use repeat sources to get to 5 news stories
      if (output.length < 5 && response.articles.length > output.length) {
        addRepeatSources(output, response, uniqueSources, allSources);
      }
    }

    if (leftOutput.length == 0 || rightOutput.length == 0) {
      // if no news data available for a given source, discard it
      continue;
    }
    // otherwise add the data for the current trending topic to the pastNewsData object
    pastNewsData[currentTrendingTopic] = {
      left: leftOutput,
      right: rightOutput,
    };
  }

  return pastNewsData;
}

/* when fetching current data from the news API, it tends to work much better if only one 
news source is given per request instead of multiple. if multiple news sources are given,
the news API sometimes returns no news sources at all. As such, the left and right sources
are stored in an array instead of a single string, which is iterated through for each API call. 
*/

async function requestCurrentNewsData(topic, source) {
  presentDataAPIKeyNumber = 1;
  let response;
  while (presentDataAPIKeyNumber <= 4) {
    PRESENT_DATA_API_KEY = process.env[`API_KEY${presentDataAPIKeyNumber}`];

    let currentDataURL = new URL(`https://newsapi.org/v2/everything?q=+${topic}&domains=${source}&
                            sortBy=relevancy&apiKey=${PRESENT_DATA_API_KEY}`);

    let promise = await fetch(currentDataURL);
    response = await promise.json();

    if (response.code && response.code == "rateLimited") {
      presentDataAPIKeyNumber += 1; // try other API keys if current API key is rate limited
    } else if (response.status && response.status == "ok") {
      break;
    }
  }
  return response;
}

// if there are no news stories for a given source and trending topic, then it is filled with
// stories from CNN or Fox news since they almost always have stories for any trending topic
// in the news API

export async function fetchCurrentData(trendingTopics) {
  const leftSources = [
    "cnn.com",
    "washingtonpost.com",
    "nytimes.com",
    "vox.com",
    "msnbc.com",
    "huffpost.com",
    "buzzfeed.com",
  ];

  const rightSources = [
    "foxnews.com",
    "breitbart.com",
    "theblaze.com",
    "nypost.com",
    "theepochtimes.com",
    "washingtontimes.com",
    "dailywire.com",
  ];

  const sources = [leftSources, rightSources];
  const sentimentAnalyzer = new Sentiment();

  let output = {};

  // for each trending topic, use API to gather news data from both
  // left and right leaning sources, of which there are around 7 sources each

  for (let currentTrendingTopic of trendingTopics) {
    let leftOutput = [];
    let rightOutput = [];

    for (let source of sources) {
      // iterate through each news source for a given bias (eg cnn for left, fox news for right)
      for (let j = 0; j < source.length; j++) {
        let response = await requestCurrentNewsData(currentTrendingTopic, source[j]);
        if (!response.articles) {
          // API rate limit so no more requests in the future will work for the current day
          return { message: "news data unavailable" };
        }

        if (response.articles.length == 0) {
          // no articles returned for the current news source
          if (j < source.length - 1) {
            continue; // continue searching if we still have some sources to search for articles left that aren't cnn or fox news
          } else if (j == source.length - 1) {
            // if we have reached the last source in the current source list, then fill
            // with cnn or fox news article
            let fillerNewsSource = source == leftSources ? "cnn.com" : "foxnews.com";

            let response = await requestCurrentNewsData(currentTrendingTopic, fillerNewsSource);

            if (!response.articles) {
              // API rate limit so no more requests in the future will work for the current day
              return { message: "news data unavailable-- API rate limited" };
            } else if (response.articles.length == 0) {
              continue; // if still no news data for the topic, then move on to the next news source
            }

            // get sentiment analysis score for the current news story that we are adding
            const currentURL = response.articles[0].url;
            const [sentimentScore, articleText] = await getNewsSentimentScore(currentURL, sentimentAnalyzer);
            const gptAnalysis = await getGPTAnalysis(articleText, currentTrendingTopic);

            // add the sentiment analysis score and GPT analysis
            response.articles[0].sentimentScore = sentimentScore;
            response.articles[0].gptAnalysis = gptAnalysis;
            response.articles[0].articleText = articleText;

            source == leftSources
              ? leftOutput.push(response.articles[0])
              : rightOutput.push(response.articles[0]);
          }
        } else {
          // get sentiment analysis score for the current news story that we are adding
          const currentURL = response.articles[0].url;
          const [sentimentScore, articleText] = await getNewsSentimentScore(currentURL, sentimentAnalyzer);
          const gptAnalysis = await getGPTAnalysis(articleText, currentTrendingTopic);
          // add the sentiment analysis score and GPT analysis
          response.articles[0].sentimentScore = sentimentScore;
          response.articles[0].gptAnalysis = gptAnalysis;
          response.articles[0].articleText = articleText;

          source == leftSources
            ? leftOutput.push(response.articles[0])
            : rightOutput.push(response.articles[0]);
          console.log(leftOutput);
          console.log(rightOutput);
        }
      }
    }

    output[currentTrendingTopic] = {
      left: leftOutput,
      right: rightOutput,
    };
  }

  removeEmptyNewsLists(output);
  return output;
}

async function getNewsSentimentScore(currentURL, sentiment) {
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

  console.log("sentiment score:");
  console.log(score);

  return [score, text];
}

async function getGPTAnalysis(articleText, trendingTopic) {
  const requestBody = JSON.stringify({
    trending_topic: trendingTopic,
    body: articleText,
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
    return null;
  }

  console.log("Analysis: ");
  console.log(analysis);

  return analysis;
}

function removeEmptyNewsLists(newsData) {
  /* Removes any lists in the news data object that do not have any 
    news data in them, which can happen from the News API output sometimes. */

  for (let currentTrendingTopic of Object.keys(newsData)) {
    if (newsData[currentTrendingTopic].left.length == 0 || newsData[currentTrendingTopic].right.length == 0) {
      delete newsData[currentTrendingTopic];
    }
  }
}

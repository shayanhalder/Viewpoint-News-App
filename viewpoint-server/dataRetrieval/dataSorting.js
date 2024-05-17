

// Object mapping a news site url to its name used in News API
export const sourceURLMap = {
    'vox.com': 'Vox',
    'cnn.com': 'CNN',
    'msnbc.com': 'MSNBC',
    'nytimes.com': 'The New York Times',
    'washingtonpost.com': 'The Washington Post',
    'huffpost.com': 'HuffPost',
    'foxnews.com': 'Fox News',
    'breitbart.com': 'Breitbart News',
    'theblaze.com': 'TheBlaze',
    'nypost.com': 'New York Post',
}

/**
 * Helper function to return an object mapping unique news source (ex: MSNBC) to an array of its occurences (indices) 
 * in pastNewsData.articles array. This will be used to maximize news diversity. 
 * @param {Object} newsData - News API output for a query in a past time frame
 * @returns {Object} Example: 
        * uniqueSourceIndices = {
            ‘CNN’: [0, 3, 4, 5],
            ‘MSNBC’: [1, 6, 7],
            ‘Washington Post’: [2, 8, 9]
          }
  The key is a unique news source, and the value is an array of the indices of its occurences in the articles array.
 */
function _getUniqueSourceIndices(newsData) {
    const uniqueSourcesSeen = new Set();
    const uniqueSourceIndices = {};
    for (let currentArticleIndex = 0; currentArticleIndex < newsData.articles.length; currentArticleIndex++) {
        const currentSource = newsData.articles[currentArticleIndex].source.name;
        if (!uniqueSourcesSeen.has(currentSource)) { // new unique source found
            uniqueSourcesSeen.add(currentSource)
            uniqueSourceIndices[currentSource] = [currentArticleIndex];
        } else { // source already seen before
            uniqueSourceIndices[currentSource].push(currentArticleIndex);
        }
    }

    return [uniqueSourceIndices, uniqueSourcesSeen];
}


/**
 * Function to select a given number of news stories from the News API output with the intention to maximize
 * news source diversity as much as possible. 
 * @param {Object} newsData - News API output for a query
 * @param {number} numStories - The number of stories that you want selected, with news source diversity maximized.
 * @returns {Array} - An array of objects that each contain info about a singular news story. 
 */
export function maximizeNewsDiversity({ newsData, numStories = 5 }) {
    const [uniqueSourceIndices, uniqueSourcesSeen] = _getUniqueSourceIndices(newsData);

    const newsSourcesUsed = new Set();
    const output = [];
    for (let i = 0; i < Object.keys(uniqueSourceIndices).length; i++) {
        if (output.length == numStories) {
            break;
        }
        const currentSource = Object.keys(uniqueSourceIndices)[i];
        const currentNewsIndex = uniqueSourceIndices[currentSource].shift(); // removes first index from the array
        if (currentNewsIndex == undefined) { // no more indices for this given news source	
            if (!newsSourcesUsed.has(currentSource))
                newsSourcesUsed.add(currentSource);
            continue;
            // one option is to delete but not good practice to mutate an object while iterating through it
        }
        const storyToBeAdded = newsData.articles[currentNewsIndex]
        output.push(storyToBeAdded);

        // on the last source and still don’t have 5 news sources, then restart iteration
        if (i === Object.keys(uniqueSourceIndices).length - 1 &&
            output.length < numStories && newsSourcesUsed.size !== Object.keys(uniqueSourceIndices).length) {
            i = -1
            // if newsSourcesUsed.size === Object.keys(uniqueSourceIndices).length, then that means we used up all of the available news sources
        }
    }

    return [output, uniqueSourcesSeen];

}


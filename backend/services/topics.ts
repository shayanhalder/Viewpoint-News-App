import * as cheerio from 'cheerio';

const TOPICS_RETRIEVAL_URL = 'https://abcnews.go.com/';

/** Gets the Trending Topics from ABC News by WebScrapping 
* @returns {Array} List of currently trending topics.
*/

export async function getTrendingTopics() : Promise<string[]> {
    const topics : string[] = [];
    const promise = await fetch(TOPICS_RETRIEVAL_URL);
    const html = await promise.text();
    const $ = cheerio.load(html);

    const items = $('a[role="menuitem"]').find('span')
    items.each(function () {
        const title = $(this).text().trim();
        if (title) {
            topics.push(title);
        }
    });
    
    return topics.splice(1, 5); // take just the first 5 trending topics 
   
    
}




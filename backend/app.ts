
import { getTrendingTopics } from './services/topics.js';

async function main() {
    const topics = await getTrendingTopics();
    console.log("Trending Topics: ", topics);
}

main();


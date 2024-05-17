import mongoose from 'mongoose'

const newsStorySchema = new mongoose.Schema({
    source: {
        id: String,
        name: String
    },
    author: String,
    title: String,
    description: String,
    url: String,
    urlToImage: String,
    publishedAt: String,
    content: String,
})

const currentNews = new mongoose.Schema({
    trending: [String],
    news: {
        type: Map, // key here is the trending topic, arbitary number of trending topics
        of: {
            left: [newsStorySchema],
            right: [newsStorySchema]
        }
    }
})

export default mongoose.model('currentNews', currentNews)

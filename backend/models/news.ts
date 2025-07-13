import mongoose from 'mongoose'

export const newsStorySchema = new mongoose.Schema({
    source: {
        type: {
            id: {
                type: String,
            },
            name: {
                type: String,
            }
        }
    },
    author: {
        type: String,
    },
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    url: {
        type: String,
    },
    urlToImage: {
        type: String,
    },
    publishedAt: {
        type: String,
    },
    content: {
        type: String,
    },
})

const currentNews = new mongoose.Schema({
    trending: {
        type: [String],
        required: true
    },
    news: {
        type: Map, // key here is the trending topic, arbitary number of trending topics
        required: true,
        of: {
            left: {
                type: [newsStorySchema],
                required: true
            },
            right: {
                type: [newsStorySchema],
                required: true
            }
        }
    }
})

export default mongoose.model('currentNews', currentNews)

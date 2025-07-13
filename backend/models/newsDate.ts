import mongoose from 'mongoose'
import { newsStorySchema } from './news'

const newsDateSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
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
                required: true,
            },
            right: {
                type: [newsStorySchema],
                required: true
            }
        }
    }
})

export default mongoose.model('newsDate', newsDateSchema)

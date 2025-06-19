import mongoose from 'mongoose'
import { newsStorySchema } from './news'

// const newsStorySchema = new mongoose.Schema({
//     source: {
//         type: Map,
//         required: true,
//         of: {
//             id: {
//                 type: String,
//                 required: true
//             },
//             name: {
//                 type: String,
//                 required: true,
//             }
//         }
//     },
//     author: {
//         type: String,
//         required: true
//     },
//     title: {
//         type: String,
//         required: true
//     },
//     description: {
//         type: String,
//         required: true
//     },
//     url: {
//         type: String,
//         required: true
//     },
//     urlToImage: {
//         type: String,
//         required: true
//     },
//     publishedAt: {
//         type: String,
//         required: true
//     },
//     content: {
//         type: String,
//         required: true
//     },
// })

const newsDateSchema = new mongoose.Schema({
    date: {
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

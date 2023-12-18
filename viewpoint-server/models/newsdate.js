import mongoose from 'mongoose'

const newsDateSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    trending: {
        type: Array,
        required: true
    },
    news: {
        type: Object,
        required: true,
    }
})

export default mongoose.model('newsDate', newsDateSchema)

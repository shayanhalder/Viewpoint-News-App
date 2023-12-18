import mongoose from 'mongoose'

const currentNews = new mongoose.Schema({
    trending: {
        type: Array,
        required: true
    },
    news: {
        type: Object,
        required: true,
    }
})

export default mongoose.model('currentNews', currentNews)

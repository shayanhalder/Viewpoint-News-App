// const mongoose = require('mongoose')
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

// module.exports = mongoose.model('currentNews', currentNews)
export default mongoose.model('currentNews', currentNews)

// const mongoose = require('mongoose')
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

// module.exports = mongoose.model('NewsDate', newsDateSchema)
export default mongoose.model('newsDate', newsDateSchema)

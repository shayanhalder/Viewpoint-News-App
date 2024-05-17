import express from 'express'
import NewsDate from '../models/newsdate.js'

const router = express.Router()

// Getting all news
router.get('/all', async (req, res) => {
    try {
        const dates = await NewsDate.find()
        res.json(dates)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Getting one news
router.get('/instance/:date', getNews, (req, res) => {
    res.json(res.news)
})


// Middleware to get news given a date in request body
async function getNews(req, res, next) {
    let news
    try {
        news = await NewsDate.find({ date: req.params.date })
        if (news == null) {
            return res.status(404).json({ message: "Cannot find news" })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
    res.news = news
    next()
}

export default router


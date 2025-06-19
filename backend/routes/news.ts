import express from 'express'
import NewsDate from '../models/newsDate'

const router = express.Router()

// Getting all news
router.get('/all', async (req, res) => {
    try {
        const dates = await NewsDate.find()
        res.json(dates)
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
})

// Getting one news
router.get('/instance/:date', getNews, (req, res: any) => {
    res.json(res.news)
})


// Middleware to get news given a date in request body
async function getNews(req: any, res: any, next: any) {
    let news
    try {
        console.log("Getting news for date: ", req.params.date);
        news = await NewsDate.find({ date: req.params.date })
        console.log("Response: ", news);
        if (news == null) {
            return res.status(404).json({ message: "Cannot find news" })
        }
    } catch (err: any) {
        return res.status(500).json({ message: err.message })
    }
    res.news = news
    next()
}

export default router


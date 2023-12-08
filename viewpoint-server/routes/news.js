import express from 'express'
import NewsDate from '../models/newsdate.js'
const router = express.Router()

const API_KEY = '623c070369de4014803bfb393262e93b'

// Getting all news
router.get('/all', async (req, res) => {
    try {
        const dates = await NewsDate.find()
        res.json(dates)
    } catch (err) {
        res.status(500).json({ message: err.message})
    }
})

// Getting one news
router.get('/instance/:date', getNews, (req, res) => {
    res.json(res.news)
})

// Creating news

router.post('/add', async (req, res) => {
    const news = new NewsDate({
        date: req.body.date,
        trending: req.body.trending,
        news: req.body.news
    })
    try {
        const newNews = await news.save()
        res.status(201).json(newNews)
    } catch (err) {
        res.status(400).json({message: err.message })
    }
})

// Updating news

router.patch('/update', getNews, async (req, res) => {
    if (req.body.date != null) {
        res.news.date = req.body.date
    }
    if (req.body.trending != null) {
        res.news.trending = req.body.trending
    }
    if (req.body.news != null) {
        res.news.news = req.body.news
    }

    try {
        const updatedNews = await res.news.save() // .save() method not working, find solution later
        res.json(updatedNews)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Deleting news
router.delete('/delete', async (req, res) => {
    try {
        const removed = await NewsDate.deleteOne( { date: req.body.date })
        res.json({message: "Deleted news", removed: removed})
    } catch (err) {
        res.status(500).json( { message: err.message })
    }
})

// Middleware to get news given a date in request body
async function getNews(req, res, next) {
    let news
    try {
        news = await NewsDate.find({ date: req.params.date})
        if (news == null) {
            return res.status(404).json( { message: "Cannot find news"})
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
    res.news = news
    next()
}



// module.exports = router
export default router

// router.get('/', (req, res) => {
//     res.send("User List")
// })

// router.get('/new', (req, res) => {
//     res.send("User new form")
// })

// // router.route() -> lets us handle multiple separate types of requests for a given path
// router
//     .route('/:id')
//     .get((req, res) => { 
//         res.send(`Get user with ID ${req.params.id}`)
//     })
//     .put((req, res) => {
//         res.send(`Update user with ID ${req.params.id}`)
//     })
//     .delete((req, res) => {
//         res.send(`Delete user with ID ${req.params.id}`)
//     })
 
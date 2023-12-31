# Viewpoint News Application

Viewpoint is a full-stack web application that webscrapes currently trending news topics and displays news from both left and right-wing media from a variety of news sources. Top stories from past dates can also be accessed as well.

The application is hosted live at: [https://viewpoint-app.netlify.app/](https://viewpoint-app.netlify.app/)

## Tech Stack
React.js + Vite were used for the front-end, and Node.js, Express, and MongoDB were used for the backend. 

## Cron Jobs
Because a given day can be filled with many breaking stories, the backend server has two Cron Jobs scheduled (one in the morning and one in the evening) to retrieve the latest trending topics. This prevents a scenario where a breaking event in the evening occurs, where our application would not display that trending topic due to having made the request in the morning of that day. 

Additionally, there is a Cron Job scheduled just before midnight for each day where the top stories and trending topics of the day are collected and uploaded to the MongoDB database so they can be accessed later. 

## Additional Dependencies
- Axios
- Mongoose
- NodeCron
- DotEnv
- Cheerio

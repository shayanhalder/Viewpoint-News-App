
/**
 * Pads a number with a zero if only a single digit (e.g: 6 -> 06)
 * @param {number} num A number representing the current month or date.
 * @returns {string} A string padding the number with a 0. 
 */
function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

/**
 * Helper function to format a date in YYYY-MM-DD format.
 * @param {Date()} date - A Date() object representing today
 * @param {number} past - A number representing how many days in the past you want the formatted date to be. 
 * @returns {string} - Date formatted in YYYY-MM-DD format
 */
export function formatDate(date, past) {
  return [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    ((past > 0) ? padTo2Digits(date.getDate() - past) : padTo2Digits(date.getDate())),
  ].join('-');
}

// /**
//  * Given news data retrieved from MongoDB database, it will remove any missing data before it is sent to the client.
//  * @param {Array} newsData - A single element array with a news data object retrieved from the MongoDB database
//  * @returns {null} - Mutates the object to remove any empty/missing/null news data before sending it to the client.
//  */
// export function removeMissingNewsData(newsData) {
//   const trendingTopics = Object.keys(newsData[0]['news'])
//   for (let currentTopic of trendingTopics) {
//     for (let newsBias in newsData[0]['news'][currentTopic]) {
//       for (let [index, currentNewsStory] of newsData[0]['news'][currentTopic][newsBias].entries()) {
//         if (currentNewsStory == null) {
//           newsData[0]['news'][currentTopic][newsBias].splice(index, index + 1)
//         }
//       }
//     }
//   }
// }

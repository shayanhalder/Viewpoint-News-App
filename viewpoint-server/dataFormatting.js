
export function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}
  
export function formatDate(date, prevDate, numPrevious) {
    return [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      ((prevDate == true) ? padTo2Digits(date.getDate() - numPrevious) : padTo2Digits(date.getDate())),
    ].join('-');
}

export function removeMissingNewsData(newsData) {
    const trendingTopics = Object.keys(newsData[0]['news'])
      for (let currentTopic of trendingTopics) {
        for (let newsBias in newsData[0]['news'][currentTopic]) {
          for (let [index, currentNewsStory] of newsData[0]['news'][currentTopic][newsBias].entries()) {
            if (currentNewsStory == null) {
              newsData[0]['news'][currentTopic][newsBias].splice(index, index+1) 
            }
          }
        }
      }
}

// returns all the indexes of one specific value in an array
export function getAllIndexes(arr, val) {
    let indexes = [], i = -1;
    while ((i = arr.indexOf(val, i + 1)) != -1) {
      indexes.push(i);
    }
    return indexes;
  }
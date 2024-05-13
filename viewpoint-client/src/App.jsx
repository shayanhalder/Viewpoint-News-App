import "./App.css";
import React, { useState, useEffect } from "react";
import Topics from "./components/Topics.jsx";
import Feed from "./components/Feed.jsx";
import Calendar from "./components/Calendar.jsx";
import formatDate from "./dateFormat.js";
import Tabs from "./components/Tabs.jsx";

const PROD_SERVER = 'https://viewpoint-node-js-backend.onrender.com'
const DEV_SERVER = 'http://localhost:3001'

function App() {
  const [trendingTopics, setTrendingTopics] = useState(); // array with the currently trending topics that were webscraped
  const [currentTopic, setCurrentTopic] = useState(); // string with the currently chosen trending topic 
  const [data, setData] = useState(); // object containing the news data information associated with each trending topic 
  const [date, setDate] = useState(formatDate(new Date())); // array with the date components in YYYY-MM-DD format
  const [viewType, setViewType] = useState("Grid"); // string indicating the current layout option ('grid' or 'individual')

  /*
    Fetches current trending news data from backend and sets
    the 'data' and 'trending' states accordingly.
  */
  async function fetchData() {
    const promise = await fetch(`${PROD_SERVER}/current`, {
      method: "GET",
    });

    const databaseOutput = await promise.json();
    let output = databaseOutput[0]; // database returns all queries in an array
    setData(output);
    output.trending.splice(0, 0, "Select topic"); // add "Select topic" as the first elements in trending topics array as a default placeholder on page load
    setTrendingTopics(output.trending);
    // TODO: remove 'trending' state variable since it is derived from the "data" object and is redundant
  }

  /*
    Fetches past news data from the /history/instance endpoint which returns 
    the news data associated with a specific date.

    Occurs whenever user changes the 'date' state variable. 
  */
  useEffect(() => {
    async function getPast() {
      console.log(date);
      const promise = await fetch(`${PROD_SERVER}/history/instance/${date}`, {
        method: "GET",
      });
      const data = await promise.json();
      if (data.length == 0) { // no data found for the given date 
        // TODO: make backend return a proper object with a 404 error
        alert("No data available for this day, try another date.");
        setData(null);
        setTrendingTopics(["N/A"]);
      } else { // data found
        data[0].trending.splice(0, 0, "Select topic"); // add "Select topic" as the first elements in trending topics array as a default placeholder on page load
        setCurrentTopic("Select topic");
        setTrendingTopics(data[0].trending);
        setData(data[0]);
      }
    }
    if (date != formatDate(new Date())) { // if date is not today, get past news data
      getPast();
    } else {
      fetchData();
    }
  }, [date]);

  // fetch current news data on page load
  useEffect(() => {
    if (date == formatDate(new Date())) {
      fetchData();
    }
  }, []);

  return (
    <>
      <h1 className="viewpoint-title-text"> Viewpoint </h1>
      <h2 style={{ textAlign: "center" }}>
        {" "}
        Trending Now:{" "}
        {trendingTopics ? (
          <Topics
            trending={trendingTopics}
            setTrending={setTrendingTopics}
            currentTopic={currentTopic}
            setCurrentTopic={setCurrentTopic}
          />
        ) : (
          <p> Loading ... </p>
        )}
      </h2>

      {trendingTopics && <Calendar pastDate={date} setPastDate={setDate} currentDate={formatDate(new Date())} />}

      <Tabs choices={["Grid", "Individual"]} setViewType={setViewType} />

      {data && currentTopic != "Select topic" && (
        <Feed data={data.news[currentTopic]} currentTopic={currentTopic} viewType={viewType} />
      )}
    </>
  );
}

export default App;

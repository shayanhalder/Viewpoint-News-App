import "./App.css";
import React, { useState, useEffect } from "react";
import Topics from "./components/Topics.jsx";
import Feed from "./components/Feed.jsx";
import Calendar from "./components/Calendar.jsx";
import formatDate from "./dateFormat.js";

function App() {
  const [trending, setTrending] = useState();
  const [currentTopic, setCurrentTopic] = useState();
  const [data, setData] = useState();
  const [date, setDate] = useState(formatDate(new Date()));

  /*
  if no data found for trending topic, make sure it isn't included in upload object for database, 
  AND remove that trending topic from the "trending" list as well. 
  
  make server update currentNews database twice a day
  */

  const API_SERVER = "https://viewpoint-node-js-backend.onrender.com";
  const LOCAL_HOST = "http://localhost:3001";

  async function fetchData() {
    const promise = await fetch(`${API_SERVER}/current`, {
      method: "GET",
    });

    let output = await promise.json();
    output = output[0]; // database returns an array even if only one element
    setData(output);
    output.trending.splice(0, 0, "Select topic"); // get rid of "Select topic"
    setTrending(output.trending);
  }

  // user changes current date, so news data for the new date is requested and stored
  useEffect(() => {
    async function getPast() {
      console.log(date);
      const promise = await fetch(`${LOCAL_HOST}/history/instance/${date}`, {
        method: "GET",
      });
      const data = await promise.json();
      console.log(data);
      if (data.length == 0) {
        alert("No data available for this day, try another date.");
        setData(null);
        setTrending(["N/A"]);
      } else {
        data[0].trending.splice(0, 0, "Select topic");
        setCurrentTopic("Select topic");
        setTrending(data[0].trending);
        setData(data[0]);
      }
    }

    // update news data if user selects a past date
    if (date != formatDate(new Date())) {
      getPast();
      console.log(date);
    } else {
      fetchData();
    }
  }, [date]);

  // if current selected date is today, then fetch today's data
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
        {trending ? (
          <Topics
            data={data}
            trending={trending}
            setTrending={setTrending}
            pastDate={date}
            currentTopic={currentTopic}
            setCurrentTopic={setCurrentTopic}
          />
        ) : (
          <p> Loading ... </p>
        )}
      </h2>

      {trending ? (
        <Calendar
          pastDate={date}
          setPastDate={setDate}
          date={formatDate(new Date())}
        />
      ) : (
        <p></p>
      )}

      {data && currentTopic != "Select topic" ? (
        <Feed data={data.news[currentTopic]} currentTopic={currentTopic} />
      ) : (
        <p style={{ textAlign: "center" }}> </p>
      )}
    </>
  );
}

export default App;

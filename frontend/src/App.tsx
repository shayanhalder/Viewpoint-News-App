import "./App.css";
import { useState, useEffect } from "react";
import Topics from "./components/Topics/Topics.tsx";
import Feed from "./components/Feed/Feed.tsx";
import Calendar from "./components/Calendar/Calendar.tsx";
import formatDate from "./dateFormat";
import Tabs from "./components/Tabs/Tabs.tsx";

const PROD_SERVER = 'https://viewpoint-server.duckdns.org';
// const DEV_SERVER = 'http://localhost:4000'

const CURRENT_SERVER = PROD_SERVER;

function App() {
  const [trendingTopics, setTrendingTopics] = useState<any>(); // array with the currently trending topics that were webscraped
  const [currentTopic, setCurrentTopic] = useState<any>(); // string with the currently chosen trending topic 
  const [data, setData] = useState<any>(); // object containing the news data information associated with each trending topic 
  const [date, setDate] = useState(formatDate(new Date())); // array with the date components in YYYY-MM-DD format
  const [viewType, setViewType] = useState("Grid"); // string indicating the current layout option ('grid' or 'individual')

  /*
    Fetches current trending news data from backend and sets
    the 'data' and 'trending' states accordingly.
  */
  async function fetchData() {
    const promise = await fetch(`${CURRENT_SERVER}/current`, {
      method: "GET",
    });

    const databaseOutput = await promise.json();
    console.log("Current news data response: ", databaseOutput);
    // let output = databaseOutput; // database returns all queries in an array
    // if (!output || !output.trending) return;
    setData(databaseOutput.news);
    if (!databaseOutput || !databaseOutput.trending)  {
      setTrendingTopics([]);
      return;
    }
    // databaseOutput.trending.splice(0, 0, "Select topic"); // add "Select topic" as the first elements in trending topics array as a default placeholder on page load
    setCurrentTopic(databaseOutput.trending[0]); // set the first trending topic as the current topic
    setTrendingTopics(databaseOutput.trending);
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
      const promise = await fetch(`${CURRENT_SERVER}/history/instance/${date}`, {
        method: "GET",
      });
      const data = await promise.json();
      console.log("Past data response: ", data);
      if (data.length == 0) { // no data found for the given date 
        // TODO: make backend return a proper object with a 404 error
        alert("No data available for this day, try another date.");
        setData(null);
        setTrendingTopics(["N/A"]);
      } else { // data found
        // data[0].trending.splice(0, 0, "Select topic"); // add "Select topic" as the first elements in trending topics array as a default placeholder on page load
        // setCurrentTopic("Select topic");
        setTrendingTopics(data[0].trending);
        setCurrentTopic(data[0].trending[0]); // set the first trending topic as the current topic
        setData(data[0].news);
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
        <Feed data={data[currentTopic]} currentTopic={currentTopic} viewType={viewType} />
      )}
    </>
  );
}

export default App;

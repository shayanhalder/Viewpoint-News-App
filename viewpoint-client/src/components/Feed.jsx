import React from "react";
import NewsList from "./NewsList.jsx";
import NewsSlider from "./NewsSlider.jsx";
import feedStyles from "../css/Feed.module.css";
import SliderStyles from "../css/NewsSlider.module.css";
import Tabs from "./Tabs.jsx";

export default function Feed({ data, currentTopic, viewType }) {
  // only display the news if we have data and the user selected a specific topic
  if (data && currentTopic != "Select topic") {
    return (
      <>
        {viewType == "Grid" ? (
          <>
            <div className={feedStyles.bias}>
              <h1 className={feedStyles.leftBiasTitle}>Left</h1>
              <h1 className={feedStyles.rightBiasTitle}>Right</h1>
            </div>
            <div className={feedStyles.container}>
              <div className={feedStyles.column}>
                <NewsList list={data.left} bias="left" />
              </div>
              <div className={feedStyles.column}>
                <NewsList list={data.right} bias="right" />
              </div>
            </div>
          </>
        ) : null}

        {viewType == "Individual" ? (
          <>
            <div className={SliderStyles.parentContainer}>
              <NewsSlider data={data} bias="left" />
            </div>
          </>
        ) : null}
      </>
    );
  } else {
    return;
  }
}

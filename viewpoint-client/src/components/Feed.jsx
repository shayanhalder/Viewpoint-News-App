import React from "react";
import NewsList from "./NewsList.jsx";
import NewsSlider from "./NewsSlider.jsx";
import feedStyles from "../css/Feed.module.css";
import SlideStyles from "../css/NewsSlider.module.css";

export default function Feed({ data, currentTopic, viewType }) {
  // only display the news if we have data and the user selected a specific topic

  return (
    <>
      {
        data && currentTopic != "Select topic" &&
        <>
          <div className={feedStyles.bias}>
            <h1 className={feedStyles.leftBiasTitle}>Left</h1>
            <h1 className={feedStyles.rightBiasTitle}>Right</h1>
          </div>

          {viewType == "Grid" && (
            <div className={feedStyles.container}>
              <div className={feedStyles.column}>
                <NewsList list={data.left} bias="left" />
              </div>
              <div className={feedStyles.column}>
                <NewsList list={data.right} bias="right" />
              </div>
            </div>
          )}

          {viewType == "Individual" && (
            <div className={SlideStyles.parentContainer}>
              <NewsSlider list={data.left} bias="left" />
              <div className={SlideStyles.verticalBar}></div>
              <NewsSlider list={data.right} bias="right" />
            </div>
          )}
        </>
      }

    </>
  );
}

import React from "react";
import NewsList from "./NewsList.jsx";
import feedStyles from "../css/Feed.module.css";

export default function Feed({ data, currentTopic }) {
  // only display the news if we have data and the user selected a specific topic
  if (data && currentTopic != "Select topic") {
    return (
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
    );
  } else {
    return;
  }
}

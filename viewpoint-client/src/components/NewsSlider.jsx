import React from "react";
import News from "./News.jsx";
import { useState } from "react";
import SliderStyles from "../css/NewsSlider.module.css";
import Tabs from "./Tabs.jsx";

export default function NewsSlider({ data, bias }) {
  const [currentBias, setCurrentBias] = useState("left");
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  let stories = [];

  for (let story of data[currentBias.toLowerCase()]) {
    let score;
    if ("sentimentScore" in story && "comparative" in story.sentimentScore) {
      score = story.sentimentScore.comparative;
    } else {
      score = undefined;
    }

    stories.push(
      <News
        key={Math.random()}
        title={story.title}
        author={story.author}
        source={story.source.name}
        imageSrc={story.urlToImage}
        desc={story.description}
        link={story.url}
        date={story.publishedAt}
        bias={currentBias.toLowerCase()}
        sentimentScore={score}
      />
    );
  }

  function switchNews(newIndex) {
    if (newIndex > stories.length - 1) {
      setCurrentStoryIndex(0);
      return;
    } else if (newIndex < 0) {
      setCurrentStoryIndex(stories.length - 1);
      return;
    }

    setCurrentStoryIndex(newIndex);
  }

  return (
    <>
      {/* <div className={SliderStyles.biasToggle}>Left/Right</div> */}
      <div className={SliderStyles.container} bias={currentBias.toLowerCase()}>
        <div className={SliderStyles.newsContainer}>
          <button onClick={() => switchNews(currentStoryIndex - 1)}> &lt; </button>
          <div>
            <div className={SliderStyles.biasToggle}>
              <Tabs choices={["Left", "Right"]} setViewType={setCurrentBias} />
            </div>
            {stories[currentStoryIndex]}
          </div>

          <button onClick={() => switchNews(currentStoryIndex + 1)}> &gt; </button>
        </div>
        <div className={SliderStyles.verticalBar}></div>
        <div className={SliderStyles.analysisContainer}>
          {"gptAnalysis" in data[currentBias.toLowerCase()][currentStoryIndex] ? (
            <div>{data[currentBias.toLowerCase()][currentStoryIndex].gptAnalysis.analysis}</div>
          ) : null}
        </div>
      </div>
    </>
  );
}

import React from "react";
import News from "./News.jsx";
import { useState, useEffect } from "react";
import SliderStyles from "../css/NewsSlider.module.css";
import Tabs from "./Tabs.jsx";
import Analysis from "./Analysis.jsx";

export default function NewsSlider({ data, bias }) {
  const [currentBias, setCurrentBias] = useState("left"); // default to show left-wing news
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentAnalysis, setCurrentAnalysis] = useState("overview"); // default to showing the overview of a given article from GPT
  let stories = []; // holds all <News /> components of the current bias (left/right)

  for (let story of data[currentBias.toLowerCase()]) {
    let score;
    if ("sentimentScore" in story && "comparative" in story.sentimentScore) {
      // make sure sentiment scores are available
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
    // changes index controlling the current story index to the proper value
    if (newIndex > stories.length - 1) {
      setCurrentStoryIndex(0);
      return;
    } else if (newIndex < 0) {
      setCurrentStoryIndex(stories.length - 1);
      return;
    }

    setCurrentStoryIndex(newIndex);
  }

  useEffect(() => {
    // set current story index to 0 when bias option switches (ex: left to right).
    // Ex): there may be more right-wing news stories than left-wing causing index bounds error when bias option switches.
    setCurrentStoryIndex(0);
  }, [currentBias]);

  return (
    <>
      <div className={SliderStyles.container} bias={currentBias.toLowerCase()}>
        <div className={SliderStyles.newsContainer}>
          {/* Contains currently selected individual news story */}
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
          {/* Contains GPT analysis text */}
          <div>
            <Tabs choices={["Overview", "Biases", "Comments"]} setViewType={setCurrentAnalysis} />
          </div>
          {data[currentBias.toLowerCase()][currentStoryIndex] != undefined && // make sure GPT analysis exists for current story
          "gptAnalysis" in data[currentBias.toLowerCase()][currentStoryIndex] ? (
            <div>
              <Analysis
                text={data[currentBias.toLowerCase()][currentStoryIndex].gptAnalysis.analysis}
                currentAnalysis={currentAnalysis.toLowerCase()}
              />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

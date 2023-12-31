import React from "react";
import News from "./News.jsx";
import { useState } from "react";
import SliderStyles from "../css/NewsSlider.module.css";

export default function NewsSlider({ list, bias }) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  let stories = [];

  for (let story of list) {
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
        bias={bias}
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
    <div className={SliderStyles.container} bias={bias}>
      <button onClick={() => switchNews(currentStoryIndex - 1)}> &lt; </button>

      {stories[currentStoryIndex]}

      <button onClick={() => switchNews(currentStoryIndex + 1)}> &gt; </button>
    </div>
  );
}

import React from "react";
import News from "./News.jsx";
import { useState } from "react";
import SliderStyles from "../css/NewsSlider.module.css";

export default function NewsSlider({ list, bias }) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0); // handles displaying the current story in the slider
  let stories = [];

  for (let story of list) {
    let score;
    // check if the key fields exist in the news story data object
    if ("sentimentScore" in story && "comparative" in story.sentimentScore) {
      score = story.sentimentScore.comparative;
    } else {
      score = undefined; // value of undefined will be handled by News.jsx component 
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

  /**
   * Cycle to a different news item given a new index number, handling out of bounds indices.
  * @param {number} newIndex The new index you want the slider to switch to.  
  * @returns {null}
  */

  function switchNews(newIndex) {
    if (newIndex > stories.length - 1) {
      setCurrentStoryIndex(0); // reset index to 0 when out of bounds
    } else if (newIndex < 0) {
      setCurrentStoryIndex(stories.length - 1); // reset index to last news item when out of bounds
    } else {
      setCurrentStoryIndex(newIndex);
    }

  }

  return (
    <div className={SliderStyles.container} bias={bias}>
      <button onClick={() => switchNews(currentStoryIndex - 1)}> &lt; </button>

      {stories[currentStoryIndex]}

      <button onClick={() => switchNews(currentStoryIndex + 1)}> &gt; </button>
    </div>
  );
}

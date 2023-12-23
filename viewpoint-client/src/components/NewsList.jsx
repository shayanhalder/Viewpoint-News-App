import React from "react";
import News from "./News.jsx";

export default function NewsList({ list, bias }) {
  return list.map((item) => {
    let currentScore;

    if (item.sentimentScore != undefined && item.sentimentScore.comparative != 0) {
      currentScore = item.sentimentScore.comparative;
    } else {
      currentScore = undefined;
    }

    return (
      <News
        key={Math.random()}
        title={item.title}
        author={item.author}
        source={item.source.name}
        imageSrc={item.urlToImage}
        desc={item.description}
        link={item.url}
        date={item.publishedAt}
        bias={bias}
        sentimentScore={currentScore}
      />
    );
  });
}

import News from "../News/News.tsx";

export default function NewsList({ list, bias } : any) {
  return list.map((item: any) => {
    let currentScore;

    if (item.sentimentScore != undefined && item.sentimentScore.comparative != 0) {
      currentScore = item.sentimentScore.comparative;
    } else {
      currentScore = undefined; // make sentiment score undefined if 0 since score of 0 means nothing
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

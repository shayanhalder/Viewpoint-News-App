import NewsList from "../NewsList/NewsList.tsx";
import NewsSlider from "../NewsSlider/NewsSlider.tsx";
import feedStyles from "./Feed.module.css";

export default function Feed({ data, currentTopic, viewType }: any) {
  // only display the news if we have data and the user selected a specific topic

  return (
    <>
      {
        data && currentTopic != "Select topic" &&
        // data &&
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
            <div className={feedStyles.parentContainer}>
              <NewsSlider list={data.left} bias="left" />
              <div className={feedStyles.verticalBar}></div>
              <NewsSlider list={data.right} bias="right" />
            </div>
          )}
        </>
      }

    </>
  );
}

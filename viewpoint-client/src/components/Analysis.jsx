import React from "react";

export default function Analysis({ text, currentAnalysis }) {
  let analysisCategories = {}; // 3 sections in GPT analysis: overview, biases, comments. Maps a given section to its corresponding text

  let analysis = text.slice(text.indexOf("####")); // #### Used in GPT output to indicate the different sections.
  analysis = analysis.split("####").slice(1);

  for (let currentSection of analysis) {
    let bullets = currentSection.split("\n");
    bullets = bullets.filter((element) => element.trim() !== ""); // remove extra whitespace
    for (let i = 0; i < bullets.length; i++) {
      if (bullets[i].indexOf(" * ") !== -1) {
        // GPT uses "*" to indicate secondary sub-bullets
        bullets[i] = bullets[i].split("*");
        bullets[i] = bullets[i].filter((element) => element.trim() !== "" && element.trim() !== "-");
      }
    }
    let title = currentSection.split(" ")[1];
    title = title.slice(0, title.indexOf("\n")); // remove newline character

    const currentSectionTemplate = (
      <div>
        <ul>
          {bullets.slice(1).map((bullet) => {
            if (Array.isArray(bullet)) {
              // sub-bullets exists within current bullet
              return (
                <>
                  <ul>
                    {bullet.map((subBullet) => {
                      if (subBullet.trim() == "") {
                        return null;
                      }
                      return <li key={Math.random()}> {subBullet} </li>;
                    })}
                  </ul>
                </>
              );
            } else if (bullet.trim() == "") {
              return null;
            } else {
              // normal bullet
              return <li key={Math.random()}>{bullet.replace("-", "")}</li>;
            }
          })}
        </ul>
      </div>
    );
    analysisCategories[title.toLowerCase()] = currentSectionTemplate;
  }

  return <div>{analysisCategories[currentAnalysis]}</div>;
}

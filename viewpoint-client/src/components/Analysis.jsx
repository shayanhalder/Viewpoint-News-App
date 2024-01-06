import React, { useState, useEffect } from "react";

export default function Analysis({ text }) {
  let information = [];

  let analysis = text.slice(text.indexOf("####"));
  analysis = analysis.split("####").slice(1);

  console.log(analysis);

  for (let currentInfo of analysis) {
    let bullets = currentInfo.split("\n");
    bullets = bullets.filter((element) => element.trim() !== "");
    for (let i = 0; i < bullets.length; i++) {
      // let currentBullet = bullets[i];
      if (bullets[i].indexOf(" * ") !== -1) {
        // sub-bullets exist
        bullets[i] = bullets[i].split("*");
        bullets[i] = bullets[i].filter((element) => element.trim() !== "" && element.trim() !== "-");
      }
    }
    console.log("bullets: ");
    console.log(bullets);
    let title = currentInfo.split(" ")[1];
    title = title.slice(0, title.indexOf("\n"));
    const template = (
      <div>
        <p>{title}</p>
        <ul key={Math.random()}>
          {bullets.slice(1).map((bullet) => {
            if (Array.isArray(bullet)) {
              return (
                <>
                  {/* <li key={Math.random()}> {bullet[0]} </li> */}
                  <ul key={Math.random()}>
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
              return <li key={Math.random()}>{bullet.replace("-", "")}</li>;
            }
          })}
        </ul>
      </div>
    );
    information.push(template);
  }

  return (
    <div>
      {information.map((section) => (
        <div key={Math.random()}> {section} </div>
      ))}
    </div>
  );
}

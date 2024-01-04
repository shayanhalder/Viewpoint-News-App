import React, { useState, useEffect } from "react";

export default function Analysis({ text }) {
  let information = [];

  let analysis = text.slice(text.indexOf("####"));
  analysis = analysis.split("####").slice(1);

  console.log(analysis);

  for (let currentInfo of analysis) {
    const bullets = currentInfo.split(" - ");
    const template = (
      <div>
        <p>{currentInfo.split(" ")[0]}</p>
        <ul>
          {bullets.map((bullet) => {
            <li> {bullet} </li>;
          })}
        </ul>
      </div>
    );
    information.push(template);
  }

  return (
    <div>
      {information.map((section) => (
        <div> {section} </div>
      ))}
    </div>
  );
}

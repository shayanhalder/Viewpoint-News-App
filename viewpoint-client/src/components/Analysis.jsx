import React, { useState, useEffect } from "react";

export default function Analysis({ text }) {
  let information = [];

  let analysis = text.slice(text.indexOf("####"));
  analysis = analysis.split("####").slice(1);

  console.log(analysis);

  for (let currentInfo of analysis) {
    const bullets = currentInfo.split("\n- ");
    let title = currentInfo.split(" ")[1];
    title = title.slice(0, title.length - 1);
    const template = (
      <div>
        <p>{title}</p>
        <ul>
          {bullets.slice(1).map((bullet) => (
            <li key={Math.random()}>{bullet}</li>
          ))}
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

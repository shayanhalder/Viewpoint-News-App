import React, { useState } from "react";

export default function Topics({
  data,
  trending,
  setTrending,
  pastDate,
  currentTopic,
  setCurrentTopic,
}) {
  function refresh(val) {
    setCurrentTopic(val);
    if (trending[0] == "Select topic") {
      setTrending(trending.splice(1, trending.length)); // remove 'Select topic' from dropdown
    }
  }

  return (
    <>
      <select
        name="topics"
        className="inputs"
        value={currentTopic}
        onChange={(e) => refresh(e.target.value)}
      >
        {trending.map((val) => {
          return (
            <option value={val} key={Math.random()}>
              {" "}
              {val}{" "}
            </option>
          );
        })}
      </select>
    </>
  );
}

import React, { useState } from "react";
import tabStyles from "../css/Tabs.module.css";

export default function Tabs({ choices, viewType, setViewType }) {
  const [toggledChoices, setToggledChoices] = useState(1); // first choice is selected by default

  function handleViewChange(e) {
    setToggledChoices(e.target.id);
    setViewType(e.target.getAttribute("viewtype"));
  }

  return (
    <div className={tabStyles.tabs}>
      <div className={tabStyles.container}>
        {choices.map((choice, index) => {
          let style = toggledChoices == index + 1 ? tabStyles.selected : "";

          return (
            <label key={Math.random()} className={`${tabStyles.tabLabel} ${style}`}>
              <input type="radio" viewtype={choice} id={index + 1} onClick={handleViewChange} />
              {choice}
            </label>
          );
        })}
      </div>
    </div>
  );
}

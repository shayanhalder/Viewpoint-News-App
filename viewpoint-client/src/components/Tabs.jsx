import React, { useState } from "react";
import tabStyles from "../css/Tabs.module.css";

export default function Tabs({ choices }) {
  const [toggledChoices, setToggledChoices] = useState(1);

  return (
    <div className={tabStyles.tabs}>
      <div className={tabStyles.container}>
        {choices.map((choice, index) => {
          let style = toggledChoices == index + 1 ? tabStyles.selected : "";

          return (
            <label key={Math.random()} className={`${tabStyles.tabLabel} ${style}`}>
              <input type="radio" id={index + 1} onClick={(e) => setToggledChoices(e.target.id)} />
              {choice}
            </label>
          );
        })}
      </div>
    </div>
  );
}

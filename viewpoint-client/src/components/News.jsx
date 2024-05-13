import React, { useState, useEffect } from "react";
import newsStyles from "../css/News.module.css";

/**
 * Given a string, an array of targets, and a replacement, it replaces all the targets in the given string
   with a specific value. Used because sometimes News API description field contains HTML tags.
 * @param {string} string The string that you want to remove values from. 
 * @param {Array<string>} list An array of all targets that will be replaced.
 * @param {string} newVal The string that will replace the value of each of the targets.
 * @returns {string} The modified string with all targets replaced.
 */

function removeValues(string, list, newVal) {
  let temp = string;
  for (let i = 0; i < list.length; i++) {
    temp = temp.replaceAll(list[i], newVal);
  }
  return temp;
}

export default function News({ title, author, source, imageSrc, desc, link, date, bias, sentimentScore }) {
  const [modifiedDesc, setModifiedDesc] = useState();
  const [modifiedDate, setModifiedDate] = useState();

  useEffect(() => {
    if (desc.startsWith("<")) { // if HTML in description, filter out all tags
      const modifiedDescription = removeValues(desc, ["<li>", "<ol>", "</li>", "</ol>", "\\r\\n", source], "");
      setModifiedDesc(modifiedDescription);
    } else {
      setModifiedDesc(desc);
    }

    let temp = date.substring(5, 10).replace("-", "/") + ` · ${author}`; // extract only date number to be displayed
    if (temp[0] == "0" && temp[3] == "0") {
      temp = temp.replaceAll("0", ""); // unpad the date numbers-- remove leading zeros for display
    } else if (temp[0] == "0" && temp[3] !== "0") {
      temp = temp.replace("0", "");
    }
    setModifiedDate(temp);
  }, []);

  return (
    <>
      <div className={`${newsStyles.news} ${bias}Background`}>
        <a target="_blank" href={link} className={newsStyles.link}>
          <img src={imageSrc} className={newsStyles.thumbnail} />

          {sentimentScore != undefined ? (
            <span className={newsStyles.tooltip}>
              {" "}
              Sentiment: {Math.round(sentimentScore * 10 ** 4) / 10 ** 4}
            </span>
          ) : (
            <span className={newsStyles.tooltip}> Sentiment: N/A</span>
          )}

          <div className={newsStyles.text}>
            <div className={`${newsStyles.source} ${bias}`}> {source} </div>
            <div className={newsStyles.title}> {title} </div>
            <div className={newsStyles.desc}>
              {" "}
              {modifiedDesc ? (
                modifiedDesc.endsWith(".") ? (
                  modifiedDesc
                ) : (
                  modifiedDesc + "."
                )
              ) : (
                <p> Loading... </p>
              )}{" "}
            </div>

            <hr className={newsStyles.line}></hr>
            <div className={newsStyles.date}> {modifiedDate ? modifiedDate : <p> Loading... </p>} </div>
          </div>
        </a>
      </div>
    </>
  );
}

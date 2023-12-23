import React, { useState, useEffect } from "react";
import newsStyles from "../css/News.module.css";

export default function News({ title, author, source, imageSrc, desc, link, date, bias, sentimentScore }) {
  const [modifiedDesc, setModifiedDesc] = useState();
  const [modifiedDate, setModifiedDate] = useState();

  useEffect(() => {
    function removeValues(string, list, newVal) {
      let temp = string;
      for (let i = 0; i < list.length; i++) {
        temp = temp.replaceAll(list[i], newVal);
      }
      return temp;
    }
    if (desc.startsWith("<ol><li>")) {
      const temp = removeValues(desc, ["<li>", "<ol>", "</li>", "</ol>", "\\r\\n", source], "");
      setModifiedDesc(temp);
      console.log(modifiedDesc);
    } else {
      setModifiedDesc(desc);
      console.log(modifiedDesc);
    }

    let temp = date.substring(5, 10).replace("-", "/") + ` · ${author}`;
    if (temp[0] == "0" && temp[3] == "0") {
      temp = temp.replaceAll("0", "");
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

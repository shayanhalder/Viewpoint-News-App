import React, { useState, useEffect } from "react";

export default function News({
  title,
  author,
  source,
  imageSrc,
  desc,
  link,
  date,
  bias,
}) {
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
      const temp = removeValues(
        desc,
        ["<li>", "<ol>", "</li>", "</ol>", "\\r\\n", source],
        ""
      );
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
      <div className={`news ${bias}Background`}>
        <a target="_blank" href={link} className="link">
          <img src={imageSrc} className="thumbnail" />
          <div className="text">
            <div className={`source ${bias}`}> {source} </div>
            <div className="title"> {title} </div>
            <div className="desc">
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

            <hr className="line"></hr>
            <div className="date">
              {" "}
              {modifiedDate ? modifiedDate : <p> Loading... </p>}{" "}
            </div>
          </div>
        </a>
      </div>
    </>
  );
}

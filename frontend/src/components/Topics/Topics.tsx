
export default function Topics({
  trending,
  setTrending,
  currentTopic,
  setCurrentTopic,
}: any) {
  /**
   * Update current trending topic state when the select element is changed. Removes default 'Select topic' placeholder if needed. 
  * @param {number} val The new current topic that was selected.
  * @returns {null}
  */
  function refresh(val: string) {
    setCurrentTopic(val);
    if (trending[0] == "Select topic") {
      setTrending(trending.splice(1, trending.length)); // remove 'Select topic' from dropdown after an option is selected
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
        {trending.map((val: string) => {
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

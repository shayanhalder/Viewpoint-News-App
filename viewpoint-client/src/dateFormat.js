/**
 * Pads a number with a zero if only a single digit (e.g: 6 -> 06)
 * @param {number} num A number representing the current month or date.
 * @returns {string} A string padding the number with a 0. 
 */

function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}


/**
 * Formats a Date() object into YYYY-MM-DD format, which MongoDB database uses
 * @param {Date()} date - A Date() object
 * @returns {Array<string, string, string>} Array with year, month, and day of the date object.
 */

export default function formatDate(date) {
  return [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
  ].join('-');
}


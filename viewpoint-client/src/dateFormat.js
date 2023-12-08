function padTo2Digits(num) {
    /* pads a number with a zero if only a single digit (e.g: 6 -> 06) */
    
    return num.toString().padStart(2, '0');
  }
      
export default function formatDate(date) {
    /* formats a Date() object into YYYY-MM-DD format, which MongoDB database uses */
    
    return [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join('-');
}
import { updatePastData } from "../app.js";

console.log("Starting past data scheduled task: ")
const pastData = await updatePastData()
console.log("Database successfully updated with the following past news data: ", pastData)


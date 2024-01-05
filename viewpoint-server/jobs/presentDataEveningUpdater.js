import { updatePresentData } from "../app.js";

console.log("Starting evening present data scheduled task: ");
const presentData = await updatePresentData();
console.log("Database successfully updated with the following current news data: ", presentData);
process.exit();

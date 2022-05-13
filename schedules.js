require("dotenv").config();
const axios = require("axios");

const scheduleInterval = process.env.SCHEDULES_PROCESS_INTERVAL | 60 * 1000;
const startBlock = process.env.SCHEDULES_START_BLOCK | 0;

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_HOST + "/api/"
});

console.log(`Starting Bepro Network Schedules with interval ${scheduleInterval} at ${startBlock}`);

async function processPastEvents() {
  return client
    .post("past-events/bulk")
    .then(({ data }) => console.log("Ran past events.", data))
    .catch((error) =>
      console.log("Error on past events", error?.message || error))
    .finally(() =>{
      return setTimeout(async () => await processPastEvents(), scheduleInterval)
    });
}

async function moveToReady() {
  return client
    .get("past-events/move-to-open/")
    .then(({ data }) => console.log("Ran move to open.", data))
    .catch((error) =>
      console.log("Error move to open", error?.message || error))
    .finally(() => setTimeout(async () => await moveToReady(), scheduleInterval));
}

moveToReady();
processPastEvents();

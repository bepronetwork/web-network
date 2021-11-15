require('dotenv').config();
const axios = require(`axios`);

const client = axios.create({baseURL: process.env.NEXT_PUBLIC_API_HOST + `/api/`});

async function processPastEvents() {
  return client.get(`past-events/`)
    .then(({data}) => console.log(`Ran past events.`, data))
    .catch(error => console.log(`Error on past events`, error?.message || error))
    .finally(() => setTimeout(async () => await processPastEvents(), 1*60*60*1000));
}

async function moveToReady() {
  return client.post(`past-events/move-to-open/`)
    .then(({data}) => console.log(`Ran move to open.`, data))
    .catch(error => console.log(`Error move to open`, error?.message || error))
    .finally(() => setTimeout(async () => await processPastEvents(), 10*60*1000));
}

moveToReady();
processPastEvents();


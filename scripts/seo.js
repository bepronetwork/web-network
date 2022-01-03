require('dotenv').config();
const axios = require(`axios`);

const client = axios.create({baseURL: process.env.NEXT_PUBLIC_API_HOST + `/api/`});

async function makeSeoBountyCards() {
  return client.get(`past-events/seo-bounty-cards/`)
    .then(({data}) => console.log(`done.`, data))
    .catch(error => console.log(`error`, error?.message || error));
}

makeSeoBountyCards();

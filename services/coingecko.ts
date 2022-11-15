
import axios from "axios";

import { getSettingsFromSessionStorage } from "helpers/settings";

import { TokenInfo } from "interfaces/token";
import {WinStorage} from "./win-storage";

const settings = getSettingsFromSessionStorage();

const COINGECKO_API = axios.create({baseURL: "https://api.coingecko.com/api/v3"});

const DEFAULT_TOKEN = settings?.currency?.defaultToken || "bepro-network";

const DEFAULT_CURRENCIES = settings?.currency?.conversionList || 
  [{value: "usd", label: "US Dollar"}, {value: "eur", label: "Euro"}];

/**
 * Get the price of a coin from CoinGecko by its currencyID
 */
const getCurrencyByToken = async (tokenId = DEFAULT_TOKEN, comparedToken?: string) => {
  const params:{ids: string, vs_currencies?: string} = {
    ids: tokenId,
  }

  if(comparedToken) params.vs_currencies = comparedToken

  try {
    const { data } = await COINGECKO_API.get("/simple/price", {
      params
    });

    return data[tokenId];
  } catch (error) {
    return {};
  }
};

/**
 * Get coin information from CoinGecko by its contract address
 */
const getCoinInfoByContract = async (contractAddress: string, asset_platform = "ethereum"): Promise<TokenInfo> => {
  const { data } = await COINGECKO_API.get(`/coins/${asset_platform}/contract/${contractAddress}`);

  const currencies = 
    DEFAULT_CURRENCIES.map(currency => ([ currency.value, data?.market_data?.current_price?.[currency.value]]));

  const info: TokenInfo = {
    name: data?.name,
    symbol: data?.symbol,
    address: contractAddress,
    icon: data?.image?.thumb,
    prices: Object.fromEntries(currencies)
  };

  return info;
};

function getCoinList() {
  const storage = new WinStorage('coingecko-list', 3600 * 60 * 1000);
  if (storage.value)
    return storage.value;
  else
    return COINGECKO_API.get(`/coins/list?include_platform=false`).then(value => storage.value = value.data);
}

async function getCoinPrice(search: string) {
  const coins = await getCoinList();
  const coinEntry = coins.find(({symbol}) => symbol === search.toLowerCase());

  if (!coinEntry)
    return 0;

  const price = await COINGECKO_API.get(`/simple/price?ids=digitalprice&vs_currencies=eur`);

  if (!price[search.toLowerCase()])
    return 0;

  return price[search.toLowerCase()].eur;
}

export {
  getCurrencyByToken,
  getCoinInfoByContract,
  getCoinPrice
};

import axios from "axios";

import { getSettingsFromSessionStorage } from "helpers/settings";

import { TokenInfo } from "interfaces/token";

const settings = getSettingsFromSessionStorage();

const COINGECKO_API = axios.create({
  baseURL: settings?.currency?.api || "https://api.coingecko.com/api/v3"
});

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

export {
  getCurrencyByToken,
  getCoinInfoByContract
};
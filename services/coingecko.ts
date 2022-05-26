
import axios from "axios";
import getConfig from "next/config";

import { TokenInfo } from "interfaces/token";

const { publicRuntimeConfig } = getConfig();

const COINGECKO_API = axios.create({
  baseURL: publicRuntimeConfig?.currency?.apiUrl
});

const DEFAULT_CURRENCIES = [{value: "usd", label: "US Dollar"}, {value: "eur", label: "Euro"}];

/**
 * Get the price of a coin from CoinGecko by its currencyID
 */
const getCurrencyByToken = async (tokenId = publicRuntimeConfig?.currency?.currencyId, comparedToken?: string) => {
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
    
  const currenciesToGet = publicRuntimeConfig?.currency?.currencyCompareList ?
    JSON.parse(publicRuntimeConfig?.currency?.currencyCompareList) : DEFAULT_CURRENCIES;

  const currencies = 
    currenciesToGet.map(currency => ([ currency.value, data?.market_data?.current_price?.[currency.value]]));

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
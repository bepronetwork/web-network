import BigNumber from "bignumber.js";

import { getCoinPrice } from "services/coingecko";

import { ConvertableItem, ConvertedItem } from "types/utils";

async function getPricesAndConvert<T>(items: ConvertableItem[], fiatSymbol: string) {
  const prices = await Promise.all(items.map(async item => ({
    ...item,
    price: await getCoinPrice(item.token.symbol, fiatSymbol).catch(() => 0)
  })));

  const convert = ({ value, price}) => BigNumber(value * price);
  const hasPrice = ({ price }) => price > 0;
  const toConverted = item => ({
    ...item,
    converted: convert(item)
  });

  const converted = prices.filter(hasPrice).map(toConverted) as (T & ConvertedItem)[];
  const noConverted = prices.filter(item => !hasPrice(item)) as ConvertableItem[];
  const totalConverted = BigNumber(converted.reduce((acc, curr) => acc.plus(convert(curr)), BigNumber(0)));

  return {
    converted,
    noConverted,
    totalConverted,
  };
}

export {
  getPricesAndConvert
};
export const allSettledItemToResult = (item, rejectedValue = undefined) =>
  item.status === "fulfilled" ? item.value : rejectedValue;

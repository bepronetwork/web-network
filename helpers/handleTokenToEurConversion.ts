export function handleTokenToEurConversion(value: number,
                                           eurPrice: number,
                                           fixedValue?: number ): number {
  const decimals = fixedValue ? fixedValue : 4;
  if (!eurPrice) return 0;
  return Number((eurPrice * value).toFixed(decimals));
}

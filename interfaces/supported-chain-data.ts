export interface SupportedChainData {
  chainId: number;
  chainRpc: string;
  name: string;
  chainName: string;
  shortName: string;
  currencySymbol: string;
  currencyDecimals: string;
  currencyName: string;
  blockScanner: string;
  networkRegistry: string;
  beproTokenAddress: string;
  isDefault: boolean;
}
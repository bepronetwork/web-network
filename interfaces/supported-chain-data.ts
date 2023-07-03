export interface SupportedChainData {
  chainId: number;
  chainRpc: string;
  name: string;
  chainName: string;
  chainShortName: string;
  chainCurrencySymbol: string;
  chainCurrencyDecimals: string;
  chainCurrencyName: string;
  blockScanner?: string;
  registryAddress: string;
  eventsApi: string
  isDefault: boolean;
  color?: string;
  icon?: string;
}
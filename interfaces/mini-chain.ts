export interface MiniChainInfo {
  name: string;
  shortName: string;
  chainId: number;
  networkId: number;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpc: string[];
  activeRPC?: string;
  loading?: boolean;
  explorer?: string;
  eventsApi?: string;
  color?: string;
  icon?: string;
}
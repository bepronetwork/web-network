export interface WindowWithEthereum {
  ethereum: Ethereum;
}

export interface Ethereum {
  [key: string]: any; //eslint-disable-line
}
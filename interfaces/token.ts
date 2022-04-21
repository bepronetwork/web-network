import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();
export interface Token {
  address: string;
  name: string;
  symbol: string;
}

export const BEPRO_TOKEN: Token = {
  address: publicRuntimeConfig.contract.settler,
  name: "BEPRO",
  symbol: "$BEPRO"
};
export interface INetwork {
  id: number;
  name: string;
  updatedAt: Date;
  createdAt: Date;
  logoIcon?: string;
  fullLogo?: string;
  tokenName?: string;
  isClosed?: boolean;
  description: string;
  network_id?: number;
  colors?: ThemeColors;
  tokensStaked?: number;
  tokensLocked?: number;
  networkAddress: string;
  creatorAddress: string;
  openBountiesAmount?: number;
  openBountiesQuantity?: number;
}

export interface ThemeColors {
  text: string;
  gray: string;
  fail: string;
  shadow: string;
  oracle: string;
  primary: string;
  success: string;
  warning: string;
  secondary: string;
  background: string;
}

export interface Color {
  code: string;
  label: string;
}

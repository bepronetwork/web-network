export interface Network {
  id: number
  name: string
  creatorAddress: string
  colors?: ThemeColors
  network_id?: number
  logo?: string
  createdAt: Date
  updatedAt: Date
}

export interface ThemeColors {
  primary: string
  secondary: string
  background: string
  success: string
  warning: string
  fail: string
  shadow: string
  gray: string
}
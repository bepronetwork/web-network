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
  text: string
  background: string
  shadow: string
  gray: string
  primary: string
  secondary: string
  oracle: string
  success: string
  fail: string
  warning: string
}

export interface Color {
  label: string
  code: string
}

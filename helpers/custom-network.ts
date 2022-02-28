import { ThemeColors } from '@interfaces/network'

export const DefaultNetworkInformation = {
  lock: {
    validated: false,
    amount: 0,
    amountLocked: 0,
    amountNeeded: 0
  },
  network: {
    validated: false,
    data: {
      logoIcon: {
        preview: '',
        raw: undefined as File
      },
      fullLogo: {
        preview: '',
        raw: undefined as File
      },
      displayName: {
        data: '',
        validated: undefined
      },
      networkDescription: '',
      colors: {
        data: {} as ThemeColors,
        similar: [] as string[],
        black: [] as string[]
      }
    }
  },
  repositories: {
    validated: false,
    data: [],
    permission: false
  }
}

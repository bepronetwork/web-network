import { UrlObject } from 'url'
import { useRouter } from 'next/router'

import { hexadecimalToRGB } from '@helpers/colors'

import { ThemeColors } from '@interfaces/network'

import useApi from '@x-hooks/use-api'
import { useNetwork } from '@contexts/network'

import { BEPRO_NETWORK_NAME } from 'env'

//Todo: useNetwork was moved to context, refactor this hooks to be a theme-hooks

export default function useNetworkTheme() {
  const router = useRouter()
  const { getNetwork } = useApi()
  const {activeNetwork: network} = useNetwork()

  async function networkExists(networkName: string) {
    try {
      await getNetwork(networkName)

      return true
    } catch (error) {
      return false
    }
  }

  function DefaultTheme(): ThemeColors {
    return {
      text: getComputedStyle(document.documentElement).getPropertyValue(
        '--bs-body-color'
      ),
      background: getComputedStyle(document.documentElement).getPropertyValue(
        '--bs-body-bg'
      ),
      shadow: getComputedStyle(document.documentElement).getPropertyValue(
        '--bs-shadow'
      ),
      gray: getComputedStyle(document.documentElement).getPropertyValue(
        '--bs-gray'
      ),
      primary: getComputedStyle(document.documentElement).getPropertyValue(
        '--bs-primary'
      ),
      secondary: getComputedStyle(document.documentElement).getPropertyValue(
        '--bs-secondary'
      ),
      oracle: getComputedStyle(document.documentElement).getPropertyValue(
        '--bs-oracle'
      ),
      success: getComputedStyle(document.documentElement).getPropertyValue(
        '--bs-success'
      ),
      fail: getComputedStyle(document.documentElement).getPropertyValue(
        '--bs-fail'
      ),
      warning: getComputedStyle(document.documentElement).getPropertyValue(
        '--bs-warning'
      )
    }
  }

  function colorsToCSS(overrideColors = undefined as ThemeColors): string {
    if (!network || (!network?.colors && !overrideColors)) return ''

    const colors = {
      text: overrideColors?.text || network.colors?.text,
      background: overrideColors?.background || network.colors?.background,
      shadow: overrideColors?.shadow || network.colors?.shadow,
      gray: overrideColors?.gray || network.colors?.gray,
      primary: overrideColors?.primary || network.colors?.primary,
      secondary: overrideColors?.secondary || network.colors?.secondary,
      oracle: overrideColors?.oracle || network.colors?.oracle,
      success: overrideColors?.success || network.colors?.success,
      fail: overrideColors?.fail || network.colors?.fail,
      warning: overrideColors?.warning || network.colors?.warning
    }

    return `:root {
      --bs-bg-opacity: 1;
      ${
        (colors.gray &&
          `--bs-gray: ${colors.gray}; --bs-gray-rgb: ${hexadecimalToRGB(
            colors.gray
          ).join(',')};`) ||
        ''
      }
      ${
        (colors.fail &&
          `--bs-fail: ${colors.fail}; --bs-fail-rgb: ${hexadecimalToRGB(
            colors.fail
          ).join(',')};`) ||
        ''
      }
      ${
        (colors.shadow &&
          `--bs-shadow: ${colors.shadow}; --bs-shadow-rgb: ${hexadecimalToRGB(
            colors.shadow
          ).join(',')};`) ||
        ''
      }
      ${
        (colors.oracle &&
          `--bs-oracle: ${colors.oracle}; --bs-oracle-rgb: ${hexadecimalToRGB(
            colors.oracle
          ).join(',')};`) ||
        ''
      }
      ${
        (colors.text &&
          `--bs-body-color: ${
            colors.text
          }; --bs-body-color-rgb: ${hexadecimalToRGB(colors.text).join(
            ','
          )};`) ||
        ''
      }
      ${
        (colors.primary &&
          `--bs-primary: ${
            colors.primary
          }; --bs-primary-rgb: ${hexadecimalToRGB(colors.primary).join(
            ','
          )};`) ||
        ''
      }
      ${
        (colors.success &&
          `--bs-success: ${
            colors.success
          }; --bs-success-rgb: ${hexadecimalToRGB(colors.success).join(
            ','
          )};`) ||
        ''
      }
      ${
        (colors.warning &&
          `--bs-warning: ${
            colors.warning
          }; --bs-warning-rgb: ${hexadecimalToRGB(colors.warning).join(
            ','
          )};`) ||
        ''
      }
      ${
        (colors.secondary &&
          `--bs-secondary: ${
            colors.secondary
          }; --bs-secondary-rgb: ${hexadecimalToRGB(colors.secondary).join(
            ','
          )};`) ||
        ''
      }
      ${
        (colors.background &&
          `--bs-body-bg: ${
            colors.background
          }; --bs-body-bg-rgb: ${hexadecimalToRGB(colors.background).join(
            ','
          )};`) ||
        ''
      }
    }`
  }

  function changeNetwork(newNetwork: string): void {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        network: newNetwork
      }
    })
  }

  function getURLWithNetwork(href: string, query = {} as any): UrlObject {
    return {
      pathname: `/[network]/${href}`.replace('//', '/'),
      query: {
        ...query,
        network: query.network || router?.query?.network || BEPRO_NETWORK_NAME
      }
    }
  }

  return {
    network,
    colorsToCSS,
    DefaultTheme,
    networkExists,
    getURLWithNetwork,
    setNetwork: changeNetwork
  }
}

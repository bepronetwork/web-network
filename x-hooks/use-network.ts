import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'

import { ApplicationContext } from '@contexts/application'
import { changeLoadState } from '@contexts/reducers/change-load-state'

import { hexadecimalToRGB } from '@helpers/string'

import { Network } from '@interfaces/network'

import useApi from '@x-hooks/use-api'
import { UrlObject } from 'url'

export default function useNetwork() {
  const router = useRouter()
  const [network, setNetwork] = useState<Network>()

  const { getNetwork } = useApi()
  const { dispatch } = useContext(ApplicationContext)

  useEffect(() => {
    handleNetworkChange()
  }, [router.query.network])

  function handleNetworkChange(): void {
    const newNetwork = String(router.query.network)

    const networkFromStorage = localStorage.getItem(newNetwork)

    if (networkFromStorage) {
      setNetwork(JSON.parse(networkFromStorage))
    } else {
      dispatch(changeLoadState(true))

      getNetwork(newNetwork)
        .then(({ data }) => {
          localStorage.setItem(newNetwork, JSON.stringify(data))

          setNetwork(data)
        })
        .finally(() => {
          dispatch(changeLoadState(false))
        })
    }
  }

  function colorsToCSS(): string {
    if (!network) return ''

    return `:root {
      --bs-bg-opacity: 1;
      --bs-primary: ${network.colors.primary};
      --bs-primary-rgb: ${hexadecimalToRGB(network.colors.primary)};
      --bs-secondary: ${network.colors.secondary};
      --bs-secondary-rgb: ${hexadecimalToRGB(network.colors.secondary)};
      --bs-background: ${network.colors.background};
      --bs-background-rgb: ${hexadecimalToRGB(network.colors.background)};
      --bs-success: ${network.colors.success};
      --bs-success-rgb: ${hexadecimalToRGB(network.colors.success)};
      --bs-warning: ${network.colors.warning};
      --bs-warning-rgb: ${hexadecimalToRGB(network.colors.warning)};
      --bs-danger: ${network.colors.fail};
      --bs-danger-rgb: ${hexadecimalToRGB(network.colors.fail)};
      --bs-shadow: ${network.colors.shadow};
      --bs-shadow-rgb: ${hexadecimalToRGB(network.colors.shadow)};
      --bs-gray: ${network.colors.gray};
      --bs-gray-rgb: ${hexadecimalToRGB(network.colors.gray)};
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

  function getURLWithNetwork(href: string, query = {}) : UrlObject {
    return {
      pathname: `/[network]/${href}`.replace('//', '/'),
      query: {
        ...query,
        network: network?.name
      }
    }
  }

  return {
    network,
    setNetwork: changeNetwork,
    getURLWithNetwork,
    colorsToCSS
  }
}

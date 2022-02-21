import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import NetworkLogo from '@components/network-logo'

import { BEPRO_NETWORK_NAME, IPFS_BASE } from 'env'

import { formatNumberToNScale } from '@helpers/formatNumber'

import { Network } from '@interfaces/network'

import { BeproService } from '@services/bepro-service'

import useNetwork from '@x-hooks/use-network'
import { ApplicationContext } from '@contexts/application'
import { changeNetworksSummary } from '@contexts/reducers/change-networks-summary'
import useApi from '@x-hooks/use-api'

interface NetworkListItemProps {
  network: Network
  redirectToHome?: boolean
  updateNetworkParameter?: (networkName, parameter, value) => void
}

export default function NetworkListItem({
  network,
  redirectToHome = false,
  updateNetworkParameter = (networkName, parameter, value) => {},
  ...props
}: NetworkListItemProps) {
  const router = useRouter()

  const { getBeproCurrency } = useApi()
  const { network: currentNetwork, getURLWithNetwork } = useNetwork()

  const { dispatch } = useContext(ApplicationContext)

  function handleRedirect() {
    const url = redirectToHome ? '/' : '/account/my-network/settings'

    router.push(
      getURLWithNetwork(url, {
        network: network.name
      })
    )
  }

  useEffect(() => {
    BeproService.getTransactionalTokenName(network.networkAddress)
      .then(name => {
        updateNetworkParameter(network.name, 'tokenName', name)
      })
      .catch(console.log)

    BeproService.getBeproLocked(network.networkAddress)
      .then(amount => {
        updateNetworkParameter(network.name, 'tokensLocked', amount)
      })
      .catch(console.log)

    BeproService.getOpenIssues(network.networkAddress)
      .then((quantity) => {
        updateNetworkParameter(network.name, 'openBountiesQuantity', quantity)

        dispatch(
          changeNetworksSummary({
            label: 'bounties',
            amount: quantity,
            action: 'add'
          })
        )
      })
      .catch(console.log)

    BeproService.getTokensStaked(network.networkAddress)
      .then((amount) => {
        updateNetworkParameter(network.name, 'openBountiesAmount', amount)

        return amount
      })
      .then((amount) => {
        BeproService.getNetworkObj(network.networkAddress).then(
          (networkObj) => {
            getBeproCurrency(networkObj.transactionToken.contractAddress).then(
              ({ usd }) => {
                dispatch(
                  changeNetworksSummary({
                    label: 'amountInNetwork',
                    amount: amount * usd,
                    action: 'add'
                  })
                )
              }
            )
          }
        )
      })
      .catch(console.log)
  }, [currentNetwork])

  return (
    <div className="list-item p-20 d-flex flex-row" onClick={handleRedirect}>
      <div className="col-3">
        <div className="d-flex flex-row align-items-center gap-20">
          <NetworkLogo
            src={`${IPFS_BASE}/${network?.logoIcon}`}
            alt={`${network?.name} logo`}
          />

          <span className="caption-medium text-white">{network?.name}</span>
        </div>
      </div>

      <div className="col-3 d-flex flex-row align-items-center justify-content-center">
        <span className="caption-medium text-white">
        {network.openBountiesQuantity !== undefined
            ? formatNumberToNScale(network.openBountiesQuantity)
            : '-'}
        </span>
      </div>

      <div className="col-3 d-flex flex-row align-items-center justify-content-center">
        <span className="caption-medium text-white">
          {network.tokensLocked !== undefined ? formatNumberToNScale(network.tokensLocked) : '-'}
        </span>
      </div>

      <div className="col-3 d-flex flex-row align-items-center justify-content-end gap-20">
        <span className="caption-medium text-white">
          {network.openBountiesAmount !== undefined
            ? formatNumberToNScale(network.openBountiesAmount)
            : '-'}
        </span>

        <span
          className={`caption-medium mr-2 ${
            network?.name === BEPRO_NETWORK_NAME ? 'text-blue' : ''
          }`}
          style={{ color: `${network?.colors?.primary}` }}
        >
          ${network.tokenName || 'TOKEN'}
        </span>
      </div>
    </div>
  )
}

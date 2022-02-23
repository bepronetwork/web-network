import { useTranslation } from 'next-i18next'
import { useContext, useEffect, useState } from 'react'

import NothingFound from '@components/nothing-found'
import InternalLink from '@components/internal-link'
import NetworkListBar from '@components/network-list-bar'
import CustomContainer from '@components/custom-container'
import NetworkListItem from '@components/network-list-item'

import { ApplicationContext } from '@contexts/application'
import { changeLoadState } from '@contexts/reducers/change-load-state'

import { orderByProperty } from '@helpers/array'

import { Network } from '@interfaces/network'

import useApi from '@x-hooks/use-api'
import useNetwork from '@x-hooks/use-network'

import { BEPRO_NETWORK_NAME } from 'env'
interface NetworksListProps {
  name?: string
  networkAddress?: string
  creatorAddress?: string
  redirectToHome?: boolean
}

export default function NetworksList({
  name,
  networkAddress,
  creatorAddress,
  redirectToHome = false,
  ...props
}: NetworksListProps) {
  const { t } = useTranslation(['common', 'custom-network'])
  const [order, setOrder] = useState(['name', 'asc'])
  const [networks, setNetworks] = useState<Network[]>([])

  const { searchNetworks } = useApi()
  const { network, getURLWithNetwork } = useNetwork()

  const { dispatch } = useContext(ApplicationContext)

  function updateNetworkParameter(networkName, parameter, value) {
    const tmpNetworks = [...networks]
    const index = tmpNetworks.findIndex((el) => el.name === networkName)

    tmpNetworks[index][parameter] = value

    setNetworks(tmpNetworks)
  }

  function handleOrderChange(newOrder) {
    setNetworks(orderByProperty(networks, newOrder[0], newOrder[1]))
    setOrder(newOrder)
  }

  useEffect(() => {
    dispatch(changeLoadState(true))

    searchNetworks({
      name,
      networkAddress,
      creatorAddress,
      sortBy: 'name',
      order: 'asc'
    })
      .then(({ count, rows }) => {
        if (count > 0) setNetworks(rows)
      })
      .catch((error) => {
        console.log('Failed to retrieve networks list', error)
      })
      .finally(() => {
        dispatch(changeLoadState(false))
      })
  }, [creatorAddress])

  return (
    <CustomContainer>
      {(!networks.length && (
        <NothingFound description={t('custom-network:errors.not-found')}>
          {network ? (
            <InternalLink
              href={getURLWithNetwork(
                '/new-network',
                network.name === BEPRO_NETWORK_NAME
                  ? {}
                  : { network: BEPRO_NETWORK_NAME }
              )}
              label={String(t('actions.create-one'))}
              uppercase
              blank={network.name !== BEPRO_NETWORK_NAME}
            />
          ) : (
            ''
          )}
        </NothingFound>
      )) || (
        <>
          <NetworkListBar
            order={order}
            setOrder={handleOrderChange}
          />

          {networks.map((network) => (
            <NetworkListItem
              key={network.id}
              network={network}
              redirectToHome={redirectToHome}
              updateNetworkParameter={updateNetworkParameter}
            />
          ))}
        </>
      )}
    </CustomContainer>
  )
}

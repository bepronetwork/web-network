import { useTranslation } from 'next-i18next'
import { useContext, useEffect, useState } from 'react'

import NothingFound from '@components/nothing-found'
import InternalLink from '@components/internal-link'
import CustomContainer from '@components/custom-container'
import NetworkListItem from '@components/network-list-item'

import { ApplicationContext } from '@contexts/application'
import { changeLoadState } from '@contexts/reducers/change-load-state'

import { Network } from '@interfaces/network'

import useApi from '@x-hooks/use-api'
import useNetwork from '@x-hooks/use-network'
import NetworkListBar from './network-list-bar'
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
  const { t } = useTranslation(['common'])
  const [networks, setNetworks] = useState<Network[]>([])

  const { searchNetworks } = useApi()
  const { network, getURLWithNetwork } = useNetwork()

  const { dispatch } = useContext(ApplicationContext)

  const hasSpecificFilter = !!networkAddress || !!creatorAddress

  useEffect(() => {
    dispatch(changeLoadState(true))

    searchNetworks({ name, networkAddress, creatorAddress })
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
        <NothingFound description="You don't have a custom network created">
          {network ? <InternalLink
            href={getURLWithNetwork('/new-network', network.name === BEPRO_NETWORK_NAME ? {} : {network: BEPRO_NETWORK_NAME})}
            label={String(t('actions.create-one'))}
            uppercase
            blank={network.name !== BEPRO_NETWORK_NAME}
          /> : ''}
        </NothingFound>
      )) || (
        <>
          <NetworkListBar hideOrder={hasSpecificFilter} />

          {networks.map((network) => (
            <NetworkListItem key={network.id} network={network} redirectToHome={redirectToHome} />
          ))}
        </>
      )}
    </CustomContainer>
  )
}

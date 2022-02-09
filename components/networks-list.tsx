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

interface NetworksListProps {
  name?: string
  networkAddress?: string
  creatorAddress?: string
}

export default function NetworksList({
  name,
  networkAddress,
  creatorAddress,
  ...props
}: NetworksListProps) {
  const { t } = useTranslation(['common'])
  const [networks, setNetworks] = useState<Network[]>([])

  const { searchNetworks } = useApi()
  const { getURLWithNetwork } = useNetwork()

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
          <InternalLink
            href={getURLWithNetwork('/new-network')}
            label={String(t('actions.create-one'))}
            uppercase
          />
        </NothingFound>
      )) || (
        <>
          <NetworkListBar hideOrder={hasSpecificFilter} />

          {networks.map((network) => (
            <NetworkListItem key={network.id} network={network} />
          ))}
        </>
      )}
    </CustomContainer>
  )
}

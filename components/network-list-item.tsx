import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import NetworkLogo from '@components/network-logo'

import { IPFS_BASE } from 'env'

import { formatNumberToNScale } from '@helpers/formatNumber'

import { Network } from '@interfaces/network'

import { BeproService } from '@services/bepro-service'

import useNetwork from '@x-hooks/use-network'

interface NetworkListItemProps {
  network: Network
}

export default function NetworkListItem({
  network,
  ...props
}: NetworkListItemProps) {
  const router = useRouter()

  const [tokenLocked, setTokenLock] = useState<number>()
  const [bountiesQuantity, setBountiesQuantity] = useState<number>()
  const [openBountiesAmount, setOpenBountiesAmount] = useState<number>()

  const { getURLWithNetwork } = useNetwork()

  function handleRedirect() {
    router.push(
      getURLWithNetwork('/account/my-network/settings', {
        network: network.name
      })
    )
  }

  useEffect(() => {
    BeproService.getBeproLocked(network.networkAddress)
      .then(setTokenLock)
      .catch(console.log)
    BeproService.getOpenIssues(network.networkAddress)
      .then(setBountiesQuantity)
      .catch(console.log)
    BeproService.getTokensStaked(network.networkAddress)
      .then(setOpenBountiesAmount)
      .catch(console.log)
  }, [])

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
          {bountiesQuantity !== undefined
            ? formatNumberToNScale(bountiesQuantity)
            : '-'}
        </span>
      </div>

      <div className="col-3 d-flex flex-row align-items-center justify-content-center">
        <span className="caption-medium text-white">
          {tokenLocked !== undefined ? formatNumberToNScale(tokenLocked) : '-'}
        </span>
      </div>

      <div className="col-3 d-flex flex-row align-items-center justify-content-end gap-20">
        <span className="caption-medium text-white">
          {openBountiesAmount !== undefined
            ? formatNumberToNScale(openBountiesAmount)
            : '-'}
        </span>
        <span className="caption-medium mr-2 text-primary">$BEPRO</span>
      </div>
    </div>
  )
}

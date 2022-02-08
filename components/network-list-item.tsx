import { useRouter } from 'next/router'

import NetworkLogo from '@components/network-logo'

import { IPFS_BASE } from 'env'

import { Network } from '@interfaces/network'

import useNetwork from '@x-hooks/use-network'

interface NetworkListItemProps {
  network: Network
}

export default function NetworkListItem({
  network,
  ...props
}: NetworkListItemProps) {
  const router = useRouter()

  const { getURLWithNetwork } = useNetwork()

  function handleRedirect() {
    router.push(getURLWithNetwork('/account/my-network/settings'))
  }

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
        <span className="caption-medium text-white">232</span>
      </div>

      <div className="col-3 d-flex flex-row align-items-center justify-content-center">
        <span className="caption-medium text-white">49</span>
      </div>

      <div className="col-3 d-flex flex-row align-items-center justify-content-end gap-20">
        <span className="caption-medium text-white">495M</span>
        <span className="caption-medium mr-2 text-primary">$BEPRO</span>
      </div>
    </div>
  )
}

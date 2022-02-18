import { useContext, useEffect, useState } from 'react'

import InfoTooltip from '@components/info-tooltip'
import CustomContainer from '@components/custom-container'

import { BeproService } from '@services/bepro-service'
import { ApplicationContext } from '@contexts/application'
import { formatNumberToCurrency } from '@helpers/formatNumber'
import { changeNetworksSummary } from '@contexts/reducers/change-networks-summary'
import axios from 'axios'
import { CURRENCY_BEPRO_API } from 'env'
import useApi from '@x-hooks/use-api'

export default function NetworksHero() {
  const [networksQuantity, setNetworksQuantity] = useState(0)
  const [beproCurrency, setBeproCurrency] = useState<number>()

  const { getBeproCurrency } = useApi()

  const {
    dispatch,
    state: { networksSummary }
  } = useContext(ApplicationContext)

  useEffect(() => {
    dispatch(changeNetworksSummary({
      action: 'reset'
    }))

    BeproService.getNetworksQuantity()
      .then(quantity => setNetworksQuantity(++quantity))
      .catch(console.log)

    getBeproCurrency().then(({usd}) => setBeproCurrency(usd)).catch(console.log)
  }, [])

  return (
    <div className="banner bg-shadow network-hero">
      <CustomContainer>
        <div className="d-flex flex-column">
          <div className="d-flex flex-row">
            <h2 className="text-white mr-1">Networks</h2>
            <span className="text-white-70 pt-2">
              <InfoTooltip />
            </span>
          </div>

          <span className="mt-1 caption-medium text-white-70">
            Explanatory text
          </span>

          <div className="row mt-3">
            <div className="col-3 px-2">
              <div className="border-top border-2 mb-2"></div>
              <h4 className="text-white">{networksQuantity}</h4>
              <span className="caption-small">Number of networks</span>
            </div>

            <div className="col-3 px-2">
              <div className="border-top border-2 mb-2"></div>
              <h4 className="text-white">{networksSummary.bounties}</h4>
              <span className="caption-small">Total number of bounties</span>
            </div>

            <div className="col-3 px-2">
              <div className="border-top border-2 mb-2"></div>
              <div className="d-flex flex-row align-items-top">
                <span className="h4 text-white">{formatNumberToCurrency(networksSummary.amountInNetwork * (beproCurrency || 1))}</span>
                <span className="caption-medium text-white-70 ml-1">$USD</span>
              </div>
              <span className="caption-small">In the network</span>
            </div>

            <div className="col-3 px-2">
              <div className="border-top border-2 mb-2"></div>
              <div className="d-flex flex-row align-items-top">
                <span className="h4 text-white">{formatNumberToCurrency(networksSummary.amountDistributed * (beproCurrency || 1))}</span>
                <span className="caption-medium text-white-70 ml-1">$USD</span>
              </div>
              <span className="caption-small">Distributed</span>
            </div>
          </div>
        </div>
      </CustomContainer>
    </div>
  )
}

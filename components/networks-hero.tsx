import { useContext, useEffect, useState } from 'react'

import CustomContainer from '@components/custom-container'

import { ApplicationContext } from '@contexts/application'
import { changeNetworksSummary } from '@contexts/reducers/change-networks-summary'

import { formatNumberToCurrency } from '@helpers/formatNumber'

import { BeproService } from '@services/bepro-service'
import { useTranslation } from 'next-i18next'

export default function NetworksHero() {
  const { t } = useTranslation(['common', 'custom-network'])

  const [networksQuantity, setNetworksQuantity] = useState(0)

  const {
    dispatch,
    state: { networksSummary }
  } = useContext(ApplicationContext)

  useEffect(() => {
    dispatch(
      changeNetworksSummary({
        action: 'reset'
      })
    )
  }, [])

  useEffect(() => {
    if (BeproService.isStarted)
      BeproService.getNetworksQuantity()
        .then(setNetworksQuantity)
        .catch(console.log)
  }, [BeproService.isStarted])

  return (
    <div className="banner bg-shadow network-hero">
      <CustomContainer>
        <div className="d-flex flex-column">
          <div className="d-flex flex-row">
            <h2 className="text-white mr-1">{t('custom-network:hero.title')}</h2>
          </div>

          <span className="mt-1 caption-medium text-white-70">
            {t('custom-network:hero.explanatory-text')}
          </span>

          <div className="row mt-3">
            <div className="col-4 px-2">
              <div className="border-top border-2 mb-2"></div>
              <h4 className="text-white">{networksQuantity}</h4>
              <span className="caption-small text-gray">{t('custom-network:hero.number-of-networks')}</span>
            </div>

            <div className="col-4 px-2">
              <div className="border-top border-2 mb-2"></div>
              <h4 className="text-white">{networksSummary.bounties}</h4>
              <span className="caption-small text-gray">{t('custom-network:hero.number-of-bounties')}</span>
            </div>

            <div className="col-4 px-2">
              <div className="border-top border-2 mb-2"></div>
              <div className="d-flex flex-row align-items-top">
                <span className="h4 text-white">
                  {formatNumberToCurrency(networksSummary.amountInNetwork)}
                </span>
                <span className="caption-medium text-white-70 ml-1">$USD</span>
              </div>
              <span className="caption-small text-gray">{t('custom-network:hero.in-the-network')}</span>
            </div>

            {/* <div className="col-3 px-2">
              <div className="border-top border-2 mb-2"></div>
              <div className="d-flex flex-row align-items-top">
                <span className="h4 text-white">
                  {formatNumberToCurrency(networksSummary.amountDistributed)}
                </span>
                <span className="caption-medium text-white-70 ml-1">$USD</span>
              </div>
              <span className="caption-small">Distributed</span>
            </div> */}
          </div>
        </div>
      </CustomContainer>
    </div>
  )
}

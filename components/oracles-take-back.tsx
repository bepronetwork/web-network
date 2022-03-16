import { useTranslation } from 'next-i18next'
import { useContext, useEffect, useState } from 'react'

import OraclesBoxHeader from '@components/oracles-box-header'
import OraclesTakeBackItem from '@components/oracles-take-back-item'

import { ApplicationContext } from '@contexts/application'
import { useAuthentication } from '@contexts/authentication'

import {
  changeOraclesParse,
  changeOraclesState
} from '@reducers/change-oracles'

import { BeproService } from '@services/bepro-service'

export default function OraclesTakeBack(): JSX.Element {
  const { t } = useTranslation('my-oracles')

  const [delegatedAmount, setDelegatedAmount] = useState(0)
  const [items, setItems] = useState<[string, number][]>([])
  
  const { dispatch } = useContext(ApplicationContext)
  const { wallet, beproServiceStarted } = useAuthentication()

  let oldAddress

  function setMappedSummaryItems() {
    if (!beproServiceStarted || !wallet?.address) return
    setItems(wallet?.balance?.oracles?.delegatedEntries)
    setDelegatedAmount(wallet?.balance?.oracles.delegatedToOthers)
  }

  function updateOracles() {
    BeproService.network
      .getOraclesSummary(wallet?.address)
      .then((oracles) =>
        dispatch(
          changeOraclesState(changeOraclesParse(wallet?.address, oracles))
        )
      )
  }

  useEffect(setMappedSummaryItems, [
    beproServiceStarted,
    wallet?.address,
    wallet?.balance?.oracles
  ])

  useEffect(() => {
    if (!wallet?.address || wallet?.address === oldAddress) return

    oldAddress = wallet?.address
    updateOracles()
  }, [wallet?.balance?.staked, wallet?.address])

  return (
    <div className="col-md-10">
      <div className="content-wrapper mb-5">
        <OraclesBoxHeader
          actions={t('list-of-delegations')}
          available={delegatedAmount}
          delegatedBox
        />
        <div className="row">
          <div className="col">
            {!(items || []).length
              ? t('errors.no-delegates')
              : items.map(([address, amount]) => (
                  <OraclesTakeBackItem
                    key={[address, amount].join(`.`)}
                    address={address}
                    amount={amount.toString()}
                    onConfirm={() => updateOracles()}
                  />
                ))}
          </div>
        </div>
      </div>
    </div>
  )
}

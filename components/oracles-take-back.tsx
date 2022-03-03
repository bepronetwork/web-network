import OraclesBoxHeader from "./oracles-box-header";
import {useContext, useEffect, useState} from 'react';
import OraclesTakeBackItem from "./oracles-take-back-item";
import {ApplicationContext} from '@contexts/application';
import {BeproService} from '@services/bepro-service';
import {changeOraclesParse, changeOraclesState} from '@reducers/change-oracles';
import { useTranslation } from 'next-i18next';

export default function OraclesTakeBack(): JSX.Element {

  const {dispatch, state: {oracles, metaMaskWallet, beproInit, balance, currentAddress}} = useContext(ApplicationContext)
  const [items, setItems] = useState<[string, number][]>([]);
  const [delegatedAmount, setDelegatedAmount] = useState(0);
  const { t } = useTranslation('my-oracles')
  let oldAddress;

  function setMappedSummaryItems() {
    if (!metaMaskWallet || !beproInit || !currentAddress)
      return;
    setItems(oracles?.delegatedEntries);
    setDelegatedAmount(oracles.delegatedToOthers)
  }

  function updateOracles() {
    BeproService.network.getOraclesSummary(currentAddress)
                .then(oracles => dispatch(changeOraclesState(changeOraclesParse(currentAddress, oracles))));
  }

  useEffect(setMappedSummaryItems, [beproInit, metaMaskWallet, oracles, currentAddress]);

  useEffect(() => {
    if (!currentAddress || currentAddress === oldAddress)
      return;

    oldAddress = currentAddress;
    updateOracles();

  }, [balance.staked, currentAddress])

  return (
    <div className="col-md-10">
      <div className="content-wrapper mb-5">
        <OraclesBoxHeader actions={t('list-of-delegations')} available={delegatedAmount} delegatedBox />
        <div className="row">
          <div className="col">
            {!(items || []).length
              ? t('errors.no-delegates')
              : items.map(([address, amount]) => (
                  <OraclesTakeBackItem key={[address, amount].join(`.`)}
                                       address={address}
                                       amount={amount.toString()} onConfirm={() => updateOracles()} />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}

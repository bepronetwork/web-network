import OraclesBoxHeader from "./oracles-box-header";
import { isEmpty, isEqual, sumBy, uniqueId } from "lodash";
import {useContext, useEffect, useState} from 'react';
import OraclesTakeBackItem from "./oracles-take-back-item";
import {ApplicationContext} from '@contexts/application';
import {BeproService} from '@services/bepro-service';
import {changeOraclesParse, changeOraclesState} from '@reducers/change-oracles';

type Item = { address: string; amount: string };

export default function OraclesTakeBack(): JSX.Element {

  const {dispatch, state: {oracles, metaMaskWallet, beproInit, balance, currentAddress}} = useContext(ApplicationContext)
  const [items, setItems] = useState<[string, number][]>([]);
  const [delegatedAmount, setDelegatedAmount] = useState(0);
  let oldAddress;

  function setMappedSummaryItems() {
    if (!metaMaskWallet || !beproInit || !currentAddress)
      return;

    setItems(oracles.delegatedEntries);
    setDelegatedAmount(oracles.delegatedToOthers)
  }

  useEffect(setMappedSummaryItems, [beproInit, metaMaskWallet, oracles, currentAddress]);

  useEffect(() => {
    if (!currentAddress || currentAddress === oldAddress)
      return;

    oldAddress = currentAddress;
    BeproService.network.getOraclesSummary({address: currentAddress})
                .then(oracles => dispatch(changeOraclesState(changeOraclesParse(currentAddress, oracles))));

  }, [balance.staked, currentAddress])

  return (
    <div className="col-md-10">
      <div className="content-wrapper mb-5">
        <OraclesBoxHeader actions="List of delegations" available={delegatedAmount} />
        <div className="row">
          <div className="col">
            {isEmpty(items)
              ? "No delegates found"
              : items.map(([address, amount]) => (
                  <OraclesTakeBackItem
                    key={uniqueId("OraclesTakeBackItem_")}
                    address={address}
                    amount={amount.toString()} />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}

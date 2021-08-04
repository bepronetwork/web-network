import OraclesBoxHeader from "./oracles-box-header";
import { isEmpty, isEqual, sumBy, uniqueId } from "lodash";
import {useContext, useEffect, useState} from 'react';
import OraclesTakeBackItem from "./oracles-take-back-item";
import {ApplicationContext} from '../contexts/application';
import {BeproService} from '../services/bepro-service';

type Item = { address: string; amount: string };

export default function OraclesTakeBack(): JSX.Element {

  const {dispatch, state: {oracles, metaMaskWallet, beproInit}} = useContext(ApplicationContext)
  const [items, setItems] = useState<Item[]>([]);
  const [delegatedAmount, setDelegatedAmount] = useState(0);

  function setMappedSummaryItems() {
    if (!metaMaskWallet || !beproInit)
      return;

    function mapAmount(amount, index) {
      const address = oracles.addresses[index];
      return {amount, address}
    }

    function filterAmounts(amount, index) {
      return oracles.addresses[index] !== BeproService.address;
    }

    const issues = oracles.amounts.filter(filterAmounts).map(mapAmount);

    setItems(issues);
    setDelegatedAmount(issues.reduce((total, current) => total += +current.amount, 0))
  }

  useEffect(setMappedSummaryItems, [beproInit, metaMaskWallet, oracles]);

  return (
    <div className="col-md-10">
      <div className="content-wrapper mb-5">
        <OraclesBoxHeader actions="List of delegations" available={delegatedAmount} />
        <div className="row">
          <div className="col">
            {isEmpty(items)
              ? "No delegates found"
              : items.map(({ address, amount }) => (
                  <OraclesTakeBackItem
                    key={uniqueId("OraclesTakeBackItem_")}
                    address={address}
                    amount={amount}
                    onConfirm={(status) => console.log(status, address)}
                  />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}

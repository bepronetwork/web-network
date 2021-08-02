import OraclesBoxHeader from "./oracles-box-header";
import useAccount from "hooks/useAccount";
import { isEmpty, isEqual, sumBy, uniqueId } from "lodash";
import { useEffect, useState } from "react";
import OraclesTakeBackItem from "./oracles-take-back-item";

type Item = { address: string; amount: string };

export default function OraclesTakeBack(): JSX.Element {
  const account = useAccount();
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const mappedSummary = account.oracles?.amounts
      .map((amount: Item["amount"], index: number) => {
        const mappedAddress = account.oracles.addresses[index];

        if (!!Number(amount) && !isEqual(account.address, mappedAddress)) {
          return {
            address: mappedAddress,
            amount,
          };
        }
      })
      .filter((item: Item | undefined) => typeof item !== "undefined");

    setItems(mappedSummary);
  }, [account.oracles]);

  return (
    <div className="col-md-10">
      <div className="content-wrapper mb-5">
        <OraclesBoxHeader
          actions="List of delegations"
          available={sumBy(items, "amount")}
        />
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

import { isEmpty, isEqual, uniqueId } from "lodash";
import { useEffect, useState } from "react";
import BeproService from "services/bepro";
import OraclesTakeBackItem from "./oracles-take-back-item";

type ItemT = { address: string; amount: number };

export default function OraclesTakeBack(): JSX.Element {
  const [items, setItems] = useState<ItemT[]>([]);

  useEffect(() => {
    (async () => {
      try {
        await BeproService.login();

        const address = await BeproService.getAddress();
        const response = await BeproService.network.getOraclesSummary({
          address,
        });

        const mappedSummary = response?.amounts
          .map((amount: ItemT["amount"], index: number) => {
            const mappedAddress = response?.addresses[index];

            if (Number(amount) || !isEqual(address, mappedAddress)) {
              return {
                address: mappedAddress,
                amount,
              };
            }
          })
          .filter((item: ItemT | undefined) => {
            typeof item !== "undefined";
          });

        setItems(mappedSummary);
      } catch (error) {
        console.log("MainNav", error);
      }
    })();
  }, []);

  return (
    <div className="col-md-10">
      <div className="content-wrapper mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="h4 mb-0">Delegated Oracles</h4>
          <span className="badge-opac">200 Available</span>
        </div>
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

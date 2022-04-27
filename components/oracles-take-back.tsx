import { useEffect } from "react";

import { useTranslation } from "next-i18next";

import OraclesBoxHeader from "components/oracles-box-header";
import OraclesTakeBackItem from "components/oracles-take-back-item";

import { useAuthentication } from "contexts/authentication";

export default function OraclesTakeBack() {
  const { t } = useTranslation("my-oracles");
  const { wallet, updateWalletBalance } = useAuthentication();

  useEffect(() => {
    if (!wallet?.address) return;
    updateWalletBalance();
  }, [wallet?.address]);

  return (
    <div className="col-md-10">
      <div className="content-wrapper mb-5">
        <OraclesBoxHeader
          actions={t("list-of-delegations")}
          available={wallet?.balance?.oracles.delegatedToOthers}
          delegatedBox
        />
        <div className="row">
          <div className="col">
            {!wallet?.balance?.oracles?.delegations?.length
              ? t("errors.no-delegates")
              : wallet?.balance?.oracles?.delegations.map(({id, to, amount}) => (
                  <OraclesTakeBackItem
                    key={[to, amount].join(".")}
                    address={to}
                    delegationId={id}
                    amount={amount.toString()}
                  />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}

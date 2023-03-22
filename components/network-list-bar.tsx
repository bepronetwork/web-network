import { useTranslation } from "next-i18next";

import NetworkListBarColumn from "./network-list-bar-column";

export default function NetworkListBar({ hideOrder = false, order, setOrder }) {
  const { t } = useTranslation("custom-network");

  const invertOrder = order[1] === "asc" ? "desc" : "asc";

  function handleSetOrder(column) {
    const newOrder = order[0] === column ? invertOrder : "asc";

    setOrder([column, newOrder]);
  }

  return (
    <div className="row py-0 mx-0 mb-2 svg-with-text-color">
      <NetworkListBarColumn
        label={t("steps.network-information.fields.name.default")}
        hideOrder={hideOrder}
        columnOrder={order[1]}
        isColumnActive={order[0] === "name"}
        onClick={() => handleSetOrder("name")}
      />

      <NetworkListBarColumn
        hideOrder={hideOrder}
        columnOrder={order[1]}
        label={t("network-list-bar.number-of-bounties")}
        isColumnActive={order[0] === "totalBounties"}
        onClick={() => handleSetOrder("totalBounties")}
      />

      <NetworkListBarColumn
        hideOrder={hideOrder}
        label={t("network-list-bar.open-bounties")}
        columnOrder={order[1]}
        isColumnActive={order[0] === "openBounties"}
        onClick={() => handleSetOrder("openBounties")}
      />

      <NetworkListBarColumn
        col={2}
        hideOrder={hideOrder}
        label={t("network-list-bar.token-locked")}
        columnOrder={order[1]}
        isColumnActive={order[0] === "tokensLocked"}
        onClick={() => handleSetOrder("tokensLocked")}
      />
    </div>
  );
}

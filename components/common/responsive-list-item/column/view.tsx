import ItemAmount from "components/networks-list/item-amount";
import ResponsiveWrapper from "components/responsive-wrapper";

import { ResponsiveListItemColumnProps } from "types/components";

export default function ResponsiveListItemColumn(column: ResponsiveListItemColumnProps) {
  return(
    <ResponsiveWrapper
      className={`col d-flex flex-row align-items-center justify-content-${column?.justify || "start"}`}
      {...column?.breakpoints}
    >
      <ItemAmount
        label={column?.label}
        amount={column?.secondaryLabel}
        currency={column?.currency}
      />
    </ResponsiveWrapper>
  );
}
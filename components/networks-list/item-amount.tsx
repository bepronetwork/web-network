import TokenSymbolView from "components/common/token-symbol/view";
import If from "components/If";

interface ItemAmountProps {
  amount: string | number;
  label: string;
  currency?: string;
}

export default function ItemAmount({
  amount,
  label,
  currency
} : ItemAmountProps) {
  return(
    <div className="d-flex gap-1 bg-gray-950 text-nowrap py-1 px-2 border-radius-4 border border-gray-800">
      <If condition={typeof amount !== "undefined"}>
        <span className="caption-small font-weight-medium text-white">
          {amount}
        </span>
      </If>

      <If condition={!!currency}>
        <TokenSymbolView
            name={currency}
            className="caption-small font-weight-medium text-primary"
        />
      </If>

      <If condition={!!label}>
        <span className="caption-small font-weight-medium text-gray-500">
          {label}
        </span>
      </If>
    </div>
  );
}
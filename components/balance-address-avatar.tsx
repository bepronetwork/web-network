import { formatNumberToCurrency } from "helpers/formatNumber";

interface BalanceAddressAvatarProps {
  address: string;
  balance: number;
  currency: string;
}

export default function BalanceAddressAvatar(props: BalanceAddressAvatarProps) {
  return (
    <div className="d-flex flex-column text-right">
      <p className="caption-small mb-1 mt-1">{props.address}</p>
      <p className="caption-small mb-0 trans">
        {formatNumberToCurrency(props.balance)} {props.currency}
      </p>
    </div>
  );
}

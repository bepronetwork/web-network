import AvatarOrIdenticon from "components/avatar-or-identicon";

import { formatStringToCurrency } from "helpers/formatNumber";
import { truncateAddress } from "helpers/truncate-address";

import { PaymentInfoProps } from "types/components";

export default function PaymentInfo({
  address,
  login,
  amount,
  symbol,
  percentage,
  label,
}: PaymentInfoProps) {
  const user = login ? `@${login}` : truncateAddress(address);

  return(
    <div className="d-flex flex-column bg-gray-850 w-100 py-2">
      <div className="d-flex justify-content-between w-100">
        <div className="d-flex align-items-center mb-1 gap-2">
          <AvatarOrIdenticon
            user={login}
            address={address}
            size="xsm"
          />

          <span className="xs-small text-gray-100 mt-1">
            {user}
          </span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <span className="sm-regular text-gray-50">
            {formatStringToCurrency(amount)}
          </span>

          <span className="sm-regular text-gray-500">
            {symbol}
          </span>
        </div>
      </div>

      <div className="d-flex justify-content-between w-100">
        <span className="xs-small text-gray-500 text-uppercase">
          {label}
        </span>

        <span className="xs-small text-gray-500 text-uppercase">
          {percentage}%
        </span>
      </div>
    </div>
  );
}
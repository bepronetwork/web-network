import CopyButton from "components/common/buttons/copy/controller";

import { truncateAddress } from "helpers/truncate-address";

interface AddressWithCopyProps {
  address: string;
  textClass: string;
  truncated?: boolean;
}

export default function AddressWithCopy({
  address,
  textClass,
  truncated,
}: AddressWithCopyProps) {
  const diplayAddress = truncated ? truncateAddress(address) : address;

  return(
    <div className="d-flex align-items-center gap-2">
        <span className={textClass}>
          {diplayAddress}
        </span>

        <CopyButton value={address} />
      </div>
  );
}
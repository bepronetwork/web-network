import { useRouter } from "next/router";

import CopyIcon from "assets/icons/copy-icon";
import DelegateIcon from "assets/icons/delegate-icon";

import { CopyValue } from "helpers/copy-value";
import { formatNumberToNScale } from "helpers/formatNumber";
import { truncateAddress } from "helpers/truncate-address";

import { Curator } from "interfaces/curators";

import { useNetwork } from "x-hooks/use-network";

import Button from "./button";
import Identicon from "./identicon";

interface CuratorListItemProps {
  curator: Curator;
}

export default function CuratorListItem({ curator }: CuratorListItemProps) {
  const { getURLWithNetwork } = useNetwork();
  const router = useRouter();

  return (
    <div className="curator-list-item p-20 d-flex flex-row">
      <div className="col-2">
        <div className="d-flex align-items-center gap-20">
          <Identicon size="sm" address={curator?.address} />

          <span className="caption-small text-white text-truncate">
            {truncateAddress(curator?.address)}
          </span>
        </div>
      </div>

      <div className="col-2 d-flex align-items-center pe-4 justify-content-center">
        <span className="caption-medium text-white">
          {curator?.acceptedProposals || 0}
        </span>
      </div>

      <div className="col-2 d-flex align-items-center pe-4 justify-content-center">
        <span className="caption-medium text-white">
          {curator?.disputedProposals || 0}
        </span>
      </div>

      <div className="col-2 d-flex align-items-center justify-content-center">
        <span className="caption-medium text-white">{curator?.disputes || 0}</span>
      </div>

      <div className="col-2 d-flex align-items-center justify-content-center">
        <span className="caption-medium text-white">
          {formatNumberToNScale(curator?.tokensLocked)}
        </span>
      </div>
      <div className="col-2 d-flex align-items-center justify-content-center">
        <Button
          onClick={() => CopyValue(curator?.address)}
          className="border-dark-gray mr-1 hover-blue"
          applyTextColor={false}
          transparent
          rounded
        >
          <CopyIcon />
        </Button>
        <Button
          onClick={() => {
            router.push(getURLWithNetwork("/profile/bepro-votes", {
            curatorAddress: curator?.address
            }));
          }}
          className="border-dark-gray mr-1 hover-blue"
          applyTextColor={false}
          transparent
          rounded
        >
          <DelegateIcon />
        </Button>
      </div>
    </div>
  );
}

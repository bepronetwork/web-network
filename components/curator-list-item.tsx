import { useEffect, useRef, useState } from "react";
import { Overlay, OverlayTrigger, Popover, Tooltip } from "react-bootstrap";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import CopyIcon from "assets/icons/copy-icon";
import DelegateIcon from "assets/icons/delegate-icon";

import { useAppState } from "contexts/app-state";

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
  const { t } = useTranslation(["common", "council"]);
  const { getURLWithNetwork } = useNetwork();
  const [showCopy, setShowCopy] = useState(false);
  const { state } = useAppState();
  const router = useRouter();
  const [target, setTarget] = useState(null);
  const ref = useRef(null);

  function handleCopy(event) {
    CopyValue(curator?.address)
    setShowCopy(!showCopy)
    setTarget(event.target)
  }

  useEffect(() => {
    const timerId = setInterval(() => {
      setShowCopy(false);
    }, 1500);

    return () => clearInterval(timerId);
  }, [showCopy === true]);

  return (
    <div key={curator?.address} className="curator-list-item p-20 d-flex flex-row">
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
      <div ref={ref}>
          <Button
            key={curator?.address}
            onClick={handleCopy}
            disabled={showCopy}
            className="border-dark-gray mr-1 hover-blue"
            applyTextColor={false}
            transparent
            rounded
          >
            <CopyIcon />
          </Button>
          <Overlay
            show={showCopy}
            target={target}
            placement="top"
            container={ref}
            containerPadding={20}
          >
            <Popover id={`popover-copy-${curator?.address}`} key={curator?.address}>
              <Popover.Body className="p-small text-black">
                <strong>{t("transactions.copied", {value: null})}</strong>
              </Popover.Body>
            </Popover>
          </Overlay>
        </div>

        {state.currentUser?.walletAddress &&
          state.currentUser?.walletAddress !== curator?.address && (
            <OverlayTrigger
              key={`right-info-${curator?.address}`}
              placement="right"
              overlay={
                <Tooltip
                id={"tooltip-right"}
                className="p-small text-white"
              >
                {t("council:council-table.deletage-address")}
              </Tooltip>
              }
            >
              <div ref={ref}>
                <Button
                  onClick={() => {
                    router.push(getURLWithNetwork("/profile/bepro-votes", {
                        curatorAddress: curator?.address,
                    }));
                  }}
                  className="border-dark-gray mr-1 hover-blue"
                  applyTextColor={false}
                  key={curator?.address}
                  transparent
                  rounded
                >
                  <DelegateIcon />
                </Button>
              </div>
            </OverlayTrigger>
          )}
      </div>
    </div>
  );
}

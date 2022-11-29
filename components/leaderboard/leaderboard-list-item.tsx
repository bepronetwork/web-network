import { useEffect, useRef, useState } from "react";
import { Overlay, Popover } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import CopyIcon from "assets/icons/copy-icon";

import { CopyValue } from "helpers/copy-value";
import { truncateAddress } from "helpers/truncate-address";

import { LeaderBoard } from "interfaces/leaderboard";

import Button from "../button";
import Identicon from "../identicon";

interface LeaderBoardListItemProps {
  user: LeaderBoard;
}

export default function LeaderBoardListItem({ user }: LeaderBoardListItemProps) {
  const { t } = useTranslation(["common", "council"]);
  const [showCopy, setShowCopy] = useState(false);
  const [target, setTarget] = useState(null);
  const ref = useRef(null);

  function handleCopy(event) {
    CopyValue(user?.address)
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
    <div key={user?.address} className="curator-list-item p-20 d-flex flex-row">
      <div className="col-3">
        <div className="d-flex align-items-center gap-20">
          <Identicon size="sm" address={user?.address} />

          <span className="caption-small text-white text-truncate">
            {truncateAddress(user?.address)}
          </span>
        </div>
      </div>

      <div className="col-3 d-flex align-items-center justify-content-center">
        <span className="caption-small text-white text-truncate">
          {user?.githubHandle || "-"}
        </span>
      </div>

      <div className="col-3 d-flex align-items-center justify-content-center">
        <span className="caption-medium text-white text-truncate">
          {user?.numberNfts || 0}
        </span>
      </div>

      <div className="col-3 d-flex align-items-center justify-content-center">
      <div ref={ref}>
          <Button
            key={user?.address}
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
            <Popover id={`popover-copy-${user?.address}`} key={user?.address}>
              <Popover.Body className="p-small text-black">
                <strong>{t("transactions.copied", {value: null})}</strong>
              </Popover.Body>
            </Popover>
          </Overlay>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Overlay, Popover } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import CopyIcon from "assets/icons/copy-icon";

import Button from "components/button";
import ResponsiveListItem from "components/common/responsive-list-item/view";
import Identicon from "components/identicon";

import { CopyValue } from "helpers/copy-value";
import { truncateAddress } from "helpers/truncate-address";

import { LeaderBoard } from "interfaces/leaderboard";

interface LeaderBoardListItemProps {
  user: LeaderBoard;
}

export default function LeaderBoardListItem({ user }: LeaderBoardListItemProps) {
  const { t } = useTranslation(["common", "council"]);
  const [showCopy, setShowCopy] = useState(false);
  const [target, setTarget] = useState(null);
  const ref = useRef(null);

  const columns = [
    {
      secondaryLabel: user?.githubLogin || "-",
      breakpoints: { xs: false, md: true },
    },
    {
      label: "NFTs",
      secondaryLabel: `${user?.numberNfts || 0}`,
      breakpoints: { xs: false, md: true },
    },
  ];

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
    <ResponsiveListItem
      icon={
        <Identicon 
          size="sm"
          address={user?.address}
        />
      }
      label={truncateAddress(user?.address)}
      columns={columns}
    />
  );
}

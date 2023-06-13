import { useTranslation } from "next-i18next";

import CopyButton from "components/common/buttons/copy/controller";
import ResponsiveListItem from "components/common/responsive-list-item/view";
import Identicon from "components/identicon";

import { truncateAddress } from "helpers/truncate-address";

import { LeaderBoard } from "interfaces/leaderboard";

interface LeaderBoardListItemProps {
  user: LeaderBoard;
}

export default function LeaderBoardListItem({ user }: LeaderBoardListItemProps) {
  const { t } = useTranslation(["common", "council"]);

  const columns = [
    {
      secondaryLabel: user?.githubLogin || "-",
      breakpoints: { xs: false, md: true },
      justify: "center",
    },
    {
      label: "NFTs",
      secondaryLabel: `${user?.numberNfts || 0}`,
      breakpoints: { xs: false, md: true },
      justify: "center"
    }
  ];

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
      mobileColumnIndex={1}
      action={
        <CopyButton
          value={user?.address}
          popOverLabel="Address copied"
        />
      }
    />
  );
}

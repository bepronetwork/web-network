import { useTranslation } from "next-i18next";

import CopyButton from "components/common/buttons/copy/controller";
import ResponsiveListItem from "components/common/responsive-list-item/view";
import Identicon from "components/identicon";

import { truncateAddress } from "helpers/truncate-address";

import { LeaderBoard } from "interfaces/leaderboard";

export default function LeaderBoardListItem(leaderboard: LeaderBoard) {
  const { t } = useTranslation("leaderboard");

  const columns = [
    {
      secondaryLabel: leaderboard?.user?.githubLogin || "-",
      breakpoints: { xs: false, md: true },
      justify: "center",
    },
    {
      label: t("nfts"),
      secondaryLabel: `${leaderboard?.numberNfts || 0}`,
      breakpoints: { xs: false, md: true },
      justify: "center"
    }
  ];

  return (
    <ResponsiveListItem
      icon={
        <Identicon 
          size="sm"
          address={leaderboard?.address}
        />
      }
      label={truncateAddress(leaderboard?.address)}
      columns={columns}
      mobileColumnIndex={1}
      action={
        <CopyButton
          value={leaderboard?.address}
          popOverLabel={t("address-copied")}
        />
      }
    />
  );
}

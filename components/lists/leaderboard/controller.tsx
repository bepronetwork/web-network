import { useEffect, useState } from "react";

import LeaderBoardListView from "components/lists/leaderboard/view";

import { LeaderBoardPaginated } from "types/api";
import { LeaderBoardPageProps } from "types/pages";

export default function LeaderBoardList({ leaderboard }: LeaderBoardPageProps) {
  const [leaderBoardData, setLeaderBoardData] = useState<LeaderBoardPaginated>();

  useEffect(() => {
    if (!leaderboard) return;

    setLeaderBoardData((previous) => {
      if (!previous || leaderboard.currentPage === 1)
        return {
          ...leaderboard,
          rows: leaderboard.rows,
        };

      return {
        ...previous,
        ...leaderboard,
        rows: previous.rows.concat(leaderboard.rows),
      };
    });
  }, [leaderboard]);

  return <LeaderBoardListView leaderboard={leaderBoardData} />;
}

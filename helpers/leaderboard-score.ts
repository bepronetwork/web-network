import getConfig from "next/config";

import { LeaderBoard } from "interfaces/leaderboard";

const { publicRuntimeConfig: { leaderboardPoints } } = getConfig();

export function calculateLeaderboardScore(leaderBoard: LeaderBoard) {
  const score = {
    numberNfts: leaderBoard.numberNfts * leaderboardPoints.bountyClosedDev,
    ownedBountiesOpened: leaderBoard.ownedBountiesOpened * leaderboardPoints.bountyOpened,
    ownedBountiesClosed: leaderBoard.ownedBountiesClosed * leaderboardPoints.bountyClosedOwner,
    ownedBountiesCanceled: leaderBoard.ownedBountiesCanceled * leaderboardPoints.bountyCanceled,
    ownedProposalCreated: leaderBoard.ownedProposalCreated * leaderboardPoints.proposalCreated,
    ownedProposalAccepted: leaderBoard.ownedProposalAccepted * leaderboardPoints.proposalAccepted,
    ownedProposalRejected: leaderBoard.ownedProposalRejected * leaderboardPoints.proposalRejected
  };
  
  return {
    ...score,
    total: Object.values(score).reduce((acc, curr) => acc + curr, 0)
  };
}
import { addSeconds } from "date-fns";

export function isProposalDisputable(createdAt: Date | number, disputableTime: number, chainTime?: number): boolean {
  const now = chainTime || new Date();

  if (now <= addSeconds(new Date(createdAt), disputableTime)) return true;

  return false;
}

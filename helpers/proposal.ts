import { addSeconds } from 'date-fns'

export function isProposalDisputable(
  createdAt: string,
  disputableTime: number
): boolean {
  const now = new Date()

  if (now <= addSeconds(Date.parse(createdAt), disputableTime)) return true

  return false
}

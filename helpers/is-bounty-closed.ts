import models from "db/models";

export async function isBountyClosed(id: number) {
  const bounty = await models.issue.findOne({ where: { id } });

  if (bounty?.state === "closed") return true;

  return false;
}

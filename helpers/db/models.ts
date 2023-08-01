import { WhereOptions } from "sequelize";

export function getAssociation(association: string,
                               attributes: string[] = undefined, 
                               required = false, 
                               where: WhereOptions = {},
                               include = [],
                               on = undefined) {
  return {
    association,
    attributes,
    required,
    where,
    include,
    on
  };
}
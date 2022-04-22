
import readBountyCanceled from "helpers/api/bounty/read-canceled";
import readBountyClosed from "helpers/api/bounty/read-closed";
import readBountyCreated from "helpers/api/bounty/read-created";

export const BountyHelpers = {
    "created": ["getBountyCreatedEvents", readBountyCreated],
    "canceled": ["getBountyCanceledEvents", readBountyCanceled],
    "closed": ["getBountyDistributedEvents", readBountyClosed]
};
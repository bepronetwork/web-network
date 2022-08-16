
import readBountyCanceled from "helpers/api/bounty/read-canceled";
import readBountyClosed from "helpers/api/bounty/read-closed";
import readBountyCreated from "helpers/api/bounty/read-created";
import readBountyFunded from "helpers/api/bounty/read-funded";
import readBountyUpdated from "helpers/api/bounty/read-updated";

export const BountyHelpers = {
    "created": ["getBountyCreatedEvents", readBountyCreated],
    "canceled": ["getBountyCanceledEvents", readBountyCanceled],
    "closed": ["getBountyClosedEvents", readBountyClosed],
    "updated": ["getBountyAmountUpdatedEvents", readBountyUpdated],
    "funded": ["getBountyFundedEvents", readBountyFunded]
};
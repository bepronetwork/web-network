import readPullRequestCanceled from "helpers/api/pull-request/read-canceled";
import readPullRequestCreated from "helpers/api/pull-request/read-created";
import readPullRequestReady from "helpers/api/pull-request/read-ready";


export const PullRequestHelpers = {
    "created": ["getBountyPullRequestCreatedEvents", readPullRequestCreated],
    "ready": ["getBountyPullRequestReadyForReviewEvents", readPullRequestReady],
    "canceled": ["getBountyPullRequestCanceledEvents", readPullRequestCanceled]
};
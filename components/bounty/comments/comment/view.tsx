import { useTranslation } from "next-i18next";

import { FlexColumn } from "components/common/flex-box/view";

import {
  getTimeDifferenceInWords,
} from "helpers/formatDate";
import { truncateAddress } from "helpers/truncate-address";

import { IssueDataComment } from "interfaces/issue-data";

import AvatarOrIdenticon from "../../../avatar-or-identicon";
import MarkedRender from "../../../MarkedRender";
import CommentSettings from "./settings/controller";

export default function Comment({
  comment,
  userAddress,
  user,
  updatedAt,
  hidden,
}: IssueDataComment) {
  const { t } = useTranslation("bounty");

  if (hidden) return;

  return (
    <div className="border-radius-8 p-3 bg-gray-800 mb-3">
      <div className="d-flex align-items-baseline justify-content-between mb-2 flex-wrap-reverse">
        <div className="d-flex align-items-baseline flex-wrap">
          <FlexColumn className="justify-content-center">
            <AvatarOrIdenticon
              user={user?.githubLogin}
              address={userAddress}
              size="xsm"
            />
          </FlexColumn>
          <FlexColumn className="justify-content-center">
            <span className="xs-medium ms-2">
              {user?.githubLogin
                ? `@${user?.githubLogin}`
                : truncateAddress(userAddress)}{" "}
            </span>
          </FlexColumn>
          <FlexColumn className="align-items-baseline">
            <span className="p-small text-gray-500 ms-2">
              {updatedAt && getTimeDifferenceInWords(updatedAt, new Date(), true) }
            </span>
          </FlexColumn>
        </div>
        <CommentSettings 
          handleHide={() => console.log}
          isGovernor={false}
          hidden={false} 
          updateBountyData={() => console.log}        
        />
      </div>

      <MarkedRender
        className="p-small mb-0 comment"
        source={comment || t("no-comments-available")}
      />
    </div>
  );
}

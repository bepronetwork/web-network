import BigNumber from "bignumber.js";

import ArrowRight from "assets/icons/arrow-right";

import Avatar from "components/avatar";
import TokenSymbolView from "components/common/token-symbol/view";
import If from "components/If";
import InfoTooltip from "components/info-tooltip";

import { formatNumberToNScale } from "helpers/formatNumber";

interface ProposalDistributionListItemProps {
  percentage: string;
  value: string;
  convertedValue?: string;
  symbols: string[];
  name: string;
  description?: string;
  line?: boolean
  githubLogin?: string;
  className?: string;
  isNetworkToken?: boolean;
}

export default function ProposalDistributionListItem({
  percentage = "0",
  name,
  symbols,
  value,
  convertedValue,
  description,
  githubLogin,
  className,
  isNetworkToken,
}: ProposalDistributionListItemProps) {
  return (
    <li
      className={`d-flex align-items-center bg-gray-850 px-3 py-2 text-truncate ${className}`}
      key={name}
    >
      <div className="d-flex flex-grow-1 flex-column py-1">
        <div className="d-flex align-items-center gap-2">
          <If condition={!!githubLogin}>
            <Avatar key={githubLogin}  size="xsm"  userLogin={githubLogin} tooltip />
          </If>

          <span className="text-truncate text-gray caption-small font-weight-medium">
            {name}
          </span>

          <If condition={!!description}>
            <InfoTooltip description={description} secondaryIcon={true} />
          </If>

        </div>
      </div>
      
      <div className={"d-flex flex-column text-truncate"}>
        <div className="d-flex align-items-center gap-2 justify-content-end">
          <span className="ms-1 text-gray xs-medium">
            {percentage}%
          </span>
          
          <ArrowRight color="text-gray" width={14}/>

          <span className="xs-medium text-white text-truncate">
            {formatNumberToNScale(value)}{" "}

            <TokenSymbolView 
              name={symbols[0]} 
              className={`ps-1 pt-1 caption-small text-uppercase ${ isNetworkToken ? "text-purple": "text-primary"}`}
            />
          </span>
          
        </div>

        <If condition={!!convertedValue && BigNumber(convertedValue).gt(0)}>
          <div className="d-flex justify-content-end">
            <span className="caption-small text-light-gray">
              {convertedValue}{" "}
              <TokenSymbolView name={symbols[1]} className="ps-1 caption-small text-uppercase text-light-gray"/>
            </span>
          </div>
        </If>
      </div>
    </li>
  );
}

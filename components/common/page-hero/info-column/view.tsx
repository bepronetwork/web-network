import InfoIcon from "assets/icons/info-icon";

import Button from "components/button";
import TokenSymbolView from "components/common/token-symbol/view";
import If from "components/If";

import { formatNumberToNScale } from "helpers/formatNumber";

import { HeroInfo } from "types/components";

export default function InfoColumn(info: HeroInfo) {
  if (info.currency) {
    return (
      <div className="col px-2">
        <div className="border-top border-2 pt-2">
          <div className="d-flex flex-row align-items-top">
            <span className="h4 text-white">
              { info.hasConvertedTokens && "~ "}
              {formatNumberToNScale(info.value)}
            </span>
            
            <TokenSymbolView name={info.currency} className="caption-medium text-white-70 ml-1 mt-1" />

            <If condition={!!info.hasConvertedTokens}>
              <Button transparent className="p-0 ml-1" onClick={() => info?.setListedModalVisibility?.(true)}>
                <InfoIcon width={14} height={14} color="text-white-10" />
              </Button>
            </If>
          </div>
          <span className="caption-small text-gray">{info.label}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="col px-2">
      <div className="border-top border-2 pt-2">
        <h4 className="text-white">{info.value}</h4>
        <span className="caption-small text-gray">{info.label}</span>
      </div>
    </div>
  );
}
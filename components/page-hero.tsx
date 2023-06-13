import React from "react";

import InfoIcon from "assets/icons/info-icon";

import Button from "components/button";
import CustomContainer from "components/custom-container";

import {formatNumberToNScale} from "helpers/formatNumber";
import {highlightText} from "helpers/string";

import {Currency} from "interfaces/currency";

import TokenSymbolView from "./common/token-symbol/view";

export interface InfosHero {
  value: number | string;
  label: string;
  currency?: Currency;
  hasConvertedTokens?: boolean;
  setListedModalVisibility?: (visible: boolean) => void;
}

export interface PageHeroProps {
  title: string;
  subtitle?: string;
  infos: InfosHero[];
}

function InfoComponent(info: InfosHero) {
  if (info.currency) {
    return (
      <div className="col px-2">
        <div className="border-top border-2 mb-2"></div>
        <div className="d-flex flex-row align-items-top">
          <span className="h4 text-white">
            { info.hasConvertedTokens && "~ "}
            {formatNumberToNScale(info.value)}
          </span>
          
          <TokenSymbolView name={info.currency} className="caption-medium text-white-70 ml-1 mt-1" />

          { info.hasConvertedTokens && 
            <Button transparent className="p-0 ml-1" onClick={() => info?.setListedModalVisibility?.(true)}>
              <InfoIcon width={14} height={14} color="text-white-10" />
            </Button>
          }
        </div>
        <span className="caption-small text-gray">{info.label}</span>
      </div>
    );
  }

  return (
    <div className="col px-2">
      <div className="border-top border-2 mb-2"></div>
      <h4 className="text-white">{info.value}</h4>
      <span className="caption-small text-gray">{info.label}</span>
    </div>
  );
}

export default function PageHero({ title, subtitle, infos }: PageHeroProps) {
  return (
    <div>
      <div className="d-flex d-xl-none py-4 px-3 border-bottom border-gray-850">
        <span className="xl-semibold text-white">{title}</span>
      </div>
      
      <div className="banner-shadow d-none d-xl-flex">
        <CustomContainer>
          <div className="d-flex flex-column">
            <div className="d-flex flex-row">
              <h2 className="text-white mr-1">{title}</h2>
            </div>

            {subtitle && (
              <span
                className="mt-1 caption-medium text-white-70"
                dangerouslySetInnerHTML={{
                  __html: highlightText(subtitle)
                }}
              />
            )}

            <div className="row mt-3 pt-1">
              {React.Children.toArray(infos.map(InfoComponent))}
            </div>
          </div>
        </CustomContainer>
      </div>
    </div>
  );
}

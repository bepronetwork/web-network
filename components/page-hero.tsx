import React from "react";

import { formatNumberToCurrency } from "helpers/formatNumber";
import { highlightText } from "helpers/string";

import { Currency } from "interfaces/currency";

import CustomContainer from "./custom-container";

export interface InfosHero {
  value: number;
  label: string;
  currency?: Currency;
  key?: string;
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
            {formatNumberToCurrency(info.value)}
          </span>
          <span className="caption-medium text-white-70 ml-1">
            ${info.currency}
          </span>
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
    <div className="banner-shadow">
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
  );
}

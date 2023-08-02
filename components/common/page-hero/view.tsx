import React from "react";

import InfoColumn from "components/common/page-hero/info-column/view";
import CustomContainer from "components/custom-container";
import If from "components/If";

import {highlightText} from "helpers/string";

import { HeroInfo } from "types/components";

export interface PageHeroProps {
  title: string;
  subtitle?: string;
  infos: HeroInfo[];
}

export default function PageHero({ title, subtitle, infos }: PageHeroProps) {
  return (
    <div>
      <div className="d-flex d-xl-none pt-2 pb-3 px-3 border-bottom border-gray-850">
        <span className="xl-semibold text-white text-capitalize">{title}</span>
      </div>

      <div className="banner-shadow d-none d-xl-flex">
        <CustomContainer>
          <div className="d-flex flex-column">
            <div className="d-flex flex-row">
              <h2 className="text-white mr-1 text-capitalize">{title}</h2>
            </div>

            <If condition={!!subtitle}>
              <span
                className="mt-1 caption-medium text-white-70"
                dangerouslySetInnerHTML={{
                  __html: highlightText(subtitle)
                }}
              />
            </If>

            <div className="row mt-3 pt-1">
              {React.Children.toArray(infos.map(InfoColumn))}
            </div>
          </div>
        </CustomContainer>
      </div>
    </div>
  );
}

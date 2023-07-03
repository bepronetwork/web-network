import { ReactNode } from "react";

import { useTranslation } from "next-i18next";

import BecomeCuratorCard from "components/cards/become-curator/controller";
import MiniTabs from "components/common/mini-tabs/view";
import PageHero from "components/common/page-hero/view";
import CustomContainer from "components/custom-container";
import ScrollableTabs from "components/navigation/scrollable-tabs/view";
import ResponsiveWrapper from "components/responsive-wrapper";

import { HeroInfo, MiniTabsItem } from "types/components";

interface CuratorsPageLayoutViewProps {
  children?: ReactNode;
  networkTokenSymbol: string;
  heroInfos: HeroInfo[];
  tabsItems: MiniTabsItem[];
  isCouncil?: boolean;
}

export default function CuratorsPageLayoutView({ 
  children,
  networkTokenSymbol,
  heroInfos,
  isCouncil,
  tabsItems,
}: CuratorsPageLayoutViewProps) {
  const { t } = useTranslation(["common", "council"]);

  return (
    <>
      <PageHero
        title={t("council:title")}
        subtitle={t("council:subtitle", { token: networkTokenSymbol })}
        infos={heroInfos}
      />

      <CustomContainer className="pt-3">
        <ResponsiveWrapper xs={false} xl={true} className="justify-content-center align-items-center">
          <MiniTabs items={tabsItems} />
        </ResponsiveWrapper>

        <ResponsiveWrapper xs={true} xl={false} className="justify-content-start align-items-center">
          <ScrollableTabs tabs={tabsItems} />
        </ResponsiveWrapper>

        <div className="row justify-content-center mt-3">
          <div className="mb-3">
            <BecomeCuratorCard isCouncil={isCouncil} />
          </div>
          
          <div>
            {children}
          </div>
        </div>
      </CustomContainer>
    </>
  );
}
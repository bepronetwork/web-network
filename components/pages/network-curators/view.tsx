import React from "react";

import { useTranslation } from "next-i18next";

import BountiesList from "components/bounty/bounties-list/controller";
import CouncilLayout from "components/council-layout";
import CuratorsList from "components/curators-list";
import If from "components/If";

import { NetworkCuratorsPageProps } from "types/pages";

interface NetworkCuratorsViewProps extends NetworkCuratorsPageProps {
  type: string;
}

export default function NetworkCuratorsView({
  bounties,
  totalReadyBounties,
  type
}: NetworkCuratorsViewProps) {
  const { t } = useTranslation(["council"]);

  const isCuratorView = type === "curators-list";

  return (
    <CouncilLayout
      totalReadyBounties={totalReadyBounties}
    >
      <If 
        condition={isCuratorView}
        otherwise={
          <BountiesList
            key={type}
            emptyMessage={t("council:empty")}
            bounties={bounties}
          />
        }
      >
        <CuratorsList 
          key={"curators-list"} 
          inView={isCuratorView}
        />
      </If>
    </CouncilLayout>
  );
}
import React from "react";

import { useTranslation } from "next-i18next";

import BountiesList from "components/bounty/bounties-list/controller";
import If from "components/If";
import CuratorsPageLayout from "components/layouts/curators-page/controller";
import CuratorsList from "components/lists/curators/controller";

import { NetworkCuratorsPageProps } from "types/pages";

interface NetworkCuratorsViewProps extends NetworkCuratorsPageProps {
  type: string;
}

export default function NetworkCuratorsView({
  bounties,
  curators,
  totalReadyBounties,
  totalDistributed,
  totalLocked,
  type,
}: NetworkCuratorsViewProps) {
  const { t } = useTranslation(["council"]);

  const isCuratorView = !type || type === "curators-list";

  return (
    <CuratorsPageLayout
      totalReadyBounties={totalReadyBounties}
      totalCurators={curators.totalCurators}
      totalDistributed={totalDistributed}
      totalLocked={totalLocked}
    >
      <If 
        condition={isCuratorView}
        otherwise={
          <BountiesList
            key={type}
            emptyMessage={t("council:empty")}
            bounties={bounties}
            hideFilter
          />
        }
      >
        <CuratorsList
          key={"curators-list"} 
          curators={curators}
        />
      </If>
    </CuratorsPageLayout>
  );
}
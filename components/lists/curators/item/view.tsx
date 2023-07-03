import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import DelegateIcon from "assets/icons/delegate-icon";

import Button from "components/button";
import CopyButton from "components/common/buttons/copy/controller";
import ResponsiveListItem from "components/common/responsive-list-item/view";
import Identicon from "components/identicon";
import If from "components/If";

import { formatNumberToNScale } from "helpers/formatNumber";
import { truncateAddress } from "helpers/truncate-address";

import { Curator } from "interfaces/curators";

interface CuratorListItemProps {
  curator: Curator;
  onDelegateClick: () => void;
}

export default function CuratorListItemView({
  curator,
  onDelegateClick
}: CuratorListItemProps) {
  const { t } = useTranslation(["common", "council"]);

  const columns = [
    {
      label: t("council:council-table.closed-proposals"),
      secondaryLabel: `${curator?.acceptedProposals || 0}`,
      breakpoints: { xs: false, md: true },
      justify: "center"
    },
    {
      label: t("council:council-table.disputed-proposals"),
      secondaryLabel: `${curator?.disputedProposals || 0}`,
      breakpoints: { xs: false, md: true },
      justify: "center"
    },
    {
      label: t("council:council-table.disputes"),
      secondaryLabel: `${curator?.disputes?.length || 0}`,
      breakpoints: { xs: false, lg: true },
      justify: "center"
    },
    {
      label: t("council:council-table.total-votes"),
      secondaryLabel: 
        formatNumberToNScale(new BigNumber(curator?.tokensLocked || 0).plus(curator?.delegatedToMe).toFixed()),
      breakpoints: { xs: false, xl: true },
      justify: "center"
    }
  ];
  
  return(
    <ResponsiveListItem
      icon={
        <Identicon
          size="sm"
          address={curator?.address}
        />
      }
      label={truncateAddress(curator?.address)}
      columns={columns}
      mobileColumnIndex={3}
      action={
        <>
          <CopyButton
            value={curator?.address}
            popOverLabel={t("misc.address-copied")}
          />

          <If condition={!!onDelegateClick}>
            <Button
              color="gray-900"
              textClass="text-gray-50"
              className=" ml-1 border-radius-4 p-1 border-gray-700 not-svg"
              key={curator?.address}
              onClick={onDelegateClick}
            >
              <DelegateIcon />
            </Button>
          </If>
        </>
      }
    />
  );
}
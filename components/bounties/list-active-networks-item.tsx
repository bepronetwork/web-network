import { useTranslation } from "next-i18next";
import getConfig from "next/config";
import Link from 'next/link';

import ChainBadge from "components/chain-badge";
import If from "components/If";

import { formatNumberToNScale } from "helpers/formatNumber";

import { Network } from "interfaces/network";

import { useNetwork } from "x-hooks/use-network";

const { publicRuntimeConfig } = getConfig();

interface ListActiveNetworksItemProps {
  network: Network;
}

export default function ListActiveNetworksItem({
  network
} : ListActiveNetworksItemProps) {
  const { t } = useTranslation("bounty");

  const { getURLWithNetwork } = useNetwork();

  return(
    <Link
      href={getURLWithNetwork("/", {
        network: network.name,
        chain: network.chain.chainShortName
      })}
    >
      <div className={`cursor-pointer border border-gray-800 border-radius-8 bg-gray-900 p-3`}>
        <div className="row align-items-center gap-2">
            <div className="col-2">
              <If condition={!!network?.logoIcon}>
                <img
                  src={`${publicRuntimeConfig?.urls?.ipfs}/${network?.logoIcon}`}
                  width={40}
                  height={40}
                />
              </If>
            </div>

            <div className="col-9">
              <div className="d-flex flex-row align-items-center gap-3">
                <span className="caption-medium">{network.name}</span>
              
                <div className="d-none d-xl-flex">
                  <ChainBadge chain={network.chain} />
                </div>
                
              </div>
              <div className="d-flex justify-content-between mt-2 text-nowrap">
                <span className="bg-dark-gray p-1 border-radius-8 px-2 me-1">
                  {formatNumberToNScale(network?.totalValueLock.toFixed(0),
                                        0) || 0}{" "}
                  <span className="text-uppercase text-white-40">
                    TVL
                  </span>
                </span>
                <span className="bg-dark-gray p-1 border-radius-8 px-2">
                  {network?.totalIssues || 0}{" "}
                  <span className="text-uppercase text-white-40">
                    {t("label", { count: network?.countIssues || 0 })}
                  </span>
                </span>
              </div>
            </div>
          </div>
      </div>
    </Link>
  );
}
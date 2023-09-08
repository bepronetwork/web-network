import BigNumber from "bignumber.js";
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
        <div className="row align-items-center gx-5">
            <div className="col-2">
              <If condition={!!network?.logoIcon}>
                <img
                  src={`${publicRuntimeConfig?.urls?.ipfs}/${network?.logoIcon}`}
                  width={40}
                  height={40}
                />
              </If>
            </div>

            <div className="col-10">
              <div className="d-flex flex-row justify-content-between align-items-center gap-3">
                <span className="caption-medium network-name">{network.name}</span>
              
                <div className="d-none d-xl-flex">
                  <ChainBadge chain={network.chain} />
                </div>
                
              </div>
              <div className="d-flex align-items-center justify-content-between mt-2 text-nowrap">
                <div className="bg-dark-gray p-1 px-2 border-radius-8">
                  {formatNumberToNScale(BigNumber(network?.totalValueLock).toFixed(0),
                                        0) || 0}{" "}
                  <span className="text-uppercase text-gray-500">
                    TVL
                  </span>
                </div>

                <div className="bg-dark-gray p-1 border-radius-8 px-2">
                  {network?.totalIssues || 0}{" "}
                  <span className="text-uppercase text-gray-500">
                    {t("label", { count: network?.countIssues || 0 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
      </div>
    </Link>
  );
}
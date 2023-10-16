
import { useTranslation } from "next-i18next";
import Link from "next/link";

import ListActiveNetworksItem from "components/bounties/list-active-networks-item";
import CustomContainer from "components/custom-container";
import HorizontalScroll from "components/horizontal-scroll/controller";
import If from "components/If";
import NothingFound from "components/nothing-found";

import { Network } from "interfaces/network";

interface ListActiveNetworksProps {
  networks: Network[];
}
export default function ListActiveNetworks({
  networks
}: ListActiveNetworksProps) {
  const { t } = useTranslation(["bounty"]);

  return (
    <CustomContainer className="mb-3 px-xl-0">
      <div className="d-flex mt-2 px-1 justify-content-between">
        <h4 className="mt-1 font-weight-medium">{t("most-active-networks")}</h4>
        <Link href={"/networks"}>
          <a
            className="text-decoration-none text-primary mt-2"
            rel="noreferrer"
          >
            {t("explore-all")}
          </a>
        </Link>
      </div>

      <div className="row mt-1">
        <If
          condition={!!networks.length}
          otherwise={<NothingFound description={t("most-active-network-empty")} />}
        >
          <HorizontalScroll>
            {networks.map((network, index) => 
              <div
                className="col-12 col-sm-6 col-md-5 col-lg-4"
                key={`active-${index}-${network?.name}`}
              >
                <ListActiveNetworksItem network={network} key={`${network.name}-${network.chain.chainShortName}`} />
              </div>)}
          </HorizontalScroll>
        </If>
      </div>
    </CustomContainer>
  );
}

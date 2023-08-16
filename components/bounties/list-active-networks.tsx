import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";

import ListActiveNetworksItem from "components/bounties/list-active-networks-item";
import LoadingList from "components/bounties/loading-list";
import CustomContainer from "components/custom-container";
import HorizontalScroll from "components/horizontal-scroll/controller";
import If from "components/If";
import NothingFound from "components/nothing-found";

import { Network } from "interfaces/network";

import useApi from "x-hooks/use-api";

export default function ListActiveNetworks() {
  const router = useRouter();
  const { t } = useTranslation(["bounty"]);

  const [loading, setLoading] = useState<boolean>(false);
  const [networks, setNetworks] = useState<Network[]>([]);
  
  const { searchActiveNetworks } = useApi();

  useEffect(() => {
    setLoading(true);
    searchActiveNetworks({
      isClosed: false,
      isRegistered: true,
      name: router.query?.network?.toString()
    })
      .then((data) => {
        data?.rows && setNetworks(data.rows);
      })
      .catch(error => console.debug("Failed to searchActiveNetworks", error))
      .finally(() => setLoading(false));
  }, [router.query?.network]);

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
      
      <LoadingList loading={loading} />

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

import ExplorePageView from "components/pages/explore/view";

import { ExplorePageProps } from "types/pages";

import { useNetwork } from "x-hooks/use-network";

export default function ExplorePage(props: ExplorePageProps) {
  const { networkName } = useNetwork();

  return (
    <ExplorePageView
      networkName={networkName}
      {...props}
    />
  );
}
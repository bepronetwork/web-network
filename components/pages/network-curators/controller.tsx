import React from "react";

import { useRouter } from "next/router";

import NetworkCuratorsView from "components/pages/network-curators/view";

import { NetworkCuratorsPageProps } from "types/pages";

export default function NetworkCurators(props: NetworkCuratorsPageProps) {
  const router = useRouter();
  
  const { type } = router.query;

  return (
    <NetworkCuratorsView
      type={type?.toString()}
      {...props}
    />
  );
}
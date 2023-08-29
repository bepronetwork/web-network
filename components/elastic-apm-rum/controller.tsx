import {ReactNode, useEffect, useMemo, useState} from "react";

import init, {type ApmBase} from "@elastic/apm-rum";
import {afterFrame} from "@elastic/apm-rum-core/dist/es";
import getConfig from "next/config";
import {useRouter} from "next/router";

type ElasticApmRumOptions = {
  children: ReactNode,
  apm: ApmBase
};

export default function ElasticApmRum({children,}: ElasticApmRumOptions) {
  const router = useRouter();
  const {publicRuntimeConfig: {elastic}} = getConfig();
  const [apm] = useState<ApmBase>(init(elastic));

  const tx = useMemo(() => {
    if (!apm)
      return;
    return apm.startTransaction(router.asPath, 'route-change', {managed: true, canReuse: true,})
  }, [apm, router.asPath])


  useEffect(() => {
    if (!tx) return;
    afterFrame(() => tx && (tx as any)?.detectFinish());

    return () => {
      tx && (tx as any)?.detectFinish();
    }
  })


  return <>{children}</>
}
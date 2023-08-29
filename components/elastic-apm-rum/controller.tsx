import {useEffect, useMemo, useState} from "react";

import init, {type ApmBase} from "@elastic/apm-rum";
import {afterFrame} from "@elastic/apm-rum-core";
import getConfig from "next/config";
import {useRouter} from "next/router";

export default function ElasticApmRum() {
  const router = useRouter();
  const {publicRuntimeConfig: {elastic: {rum: elastic}}} = getConfig();
  const [apm] = useState<ApmBase>(elastic.enabled ? init(elastic) : null);

  const tx = useMemo(() => {
    if (!apm)
      return;
    return apm.startTransaction(router.asPath, 'route-change', {managed: true, canReuse: true,})
  }, [apm, router.asPath])


  useEffect(() => {
    if (!tx)
      return;

    afterFrame(() => tx && (tx as any)?.detectFinish());

    return () => {
      tx && (tx as any)?.detectFinish();
    }
  }, [tx])

  return <></>
}
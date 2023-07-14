import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import { QueryParams } from "types/utils";

export default function useQueryFilter(params: QueryParams) {
  const router = useRouter();

  const [value, setValue] = useState(params);

  function updateRouter(newValue) {
    router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          ...newValue
        }
    }, router.asPath, { shallow: false, scroll: false });
  }

  function apply() {
    updateRouter(value);
  }

  function updateQuery(newParams, applyToRouter?: boolean, appendPrevious =  true) {    
    const getNewValue = previous => ({
      ... appendPrevious ? previous : {},
      ...newParams
    });

    if (applyToRouter)
      updateRouter(getNewValue(value));
    else
      setValue(previous => getNewValue(previous));
  }

  useEffect(() => {
    if (!router?.query) {
      setValue(undefined);
      return;
    }

    setValue(Object.fromEntries(Object.keys(value).map(key => [key, router?.query[key]?.toString()])));
  }, [router?.query]);

  return {
    value,
    setValue: updateQuery,
    apply,
  }
}
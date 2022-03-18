import { useContext } from "react";

import { ApplicationContext } from "contexts/application";
import { BlockTransaction } from "interfaces/transaction";
import { updateTransaction } from "contexts/reducers/update-transaction";

export default function useTransactions() {
  const {
    state: { myTransactions },
    dispatch
  } = useContext(ApplicationContext);

  function findItem(_id: string) {
    return myTransactions.find(({ id }) => id === _id);
  }

  function updateItem(id: string, mergePayload: Partial<BlockTransaction>) {
    const old = findItem(id);
    dispatch(updateTransaction({ ...old, ...(mergePayload as any) }));
  }

  return { findItem, updateItem };
}

import { createContext, Dispatch, SetStateAction, useState } from "react";
import Loading from "../components/loading";

let setStateAction: Dispatch<SetStateAction<boolean>>;

const LoadingContext = createContext(setStateAction);

function LoadingContextProvider({ children }) {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <LoadingContext.Provider value={setLoading}>
      <Loading show={loading} />
      {children}
    </LoadingContext.Provider>
  );
}

export { LoadingContextProvider, LoadingContext };

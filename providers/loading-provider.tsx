import { createContext, Dispatch, SetStateAction, useState } from "react";
import Loading from "../components/loading";

let getLoadingState: () => boolean;

let setLoadingState: (value: boolean) => void;

const LoadingContext = createContext(false)

function LoadingContextProvider({ children }) {
  const [isLoading, setLoading] = useState<boolean>(false);
  setLoadingState = (value: boolean) => setLoading(value);
  getLoadingState = () => isLoading;

  return (
    <LoadingContext.Provider value={isLoading}>
      <Loading show={isLoading} />
      {children}
    </LoadingContext.Provider>
  );
}

export { LoadingContextProvider, LoadingContext, setLoadingState, getLoadingState };
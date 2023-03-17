import { ReactNode } from "react";

export default function SelectNetwork({children}: { children?: ReactNode}) {
  return (
    <div className="mt-2">
      <h5>Select Network</h5>
      <p className="text-gray">
        Est quis sit irure exercitation id consequat cupidatat elit nulla velit
        amet ex.
      </p>
      <div className="col-md-6">
        {children}
      </div>  
    </div>
  );
}

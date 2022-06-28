import React, { ReactNode } from "react";

import NotFoundIcon from "assets/icons/not-found-icon";

type NothingFoundProps = {
  description: string;
  children?: ReactNode;
};

export default function NothingFound({
  description,
  children
}: NothingFoundProps) {
  return (
    <div className="d-flex flex-column align-items-center gap-4 mt-3">
      <NotFoundIcon height={52} width={56} />
      <p className="caption-small text-center text-gray mb-0">{description}</p>
      {children}
    </div>
  );
}
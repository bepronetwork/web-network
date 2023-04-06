import React, { ReactNode } from "react";

import NotFoundIcon from "assets/icons/not-found-icon";

interface NothingFoundProps {
  description: string;
  children?: ReactNode;
  type?: "default" | "dashed";
}

export default function NothingFound({
  type = "default",
  description,
  children,
}: NothingFoundProps) {
  const divClass = `d-flex flex-column ${
    type === "default"
      ? "align-items-center gap-4 mt-3"
      : "justify-content-center p-3 border-dashed bg-gray-900 border-radius-8 min-h-card"
  }`;
  const descriptionClass = `mb-0 text-center ${
    type === "default" ? "caption-small text-gray" : "text-white-50"
  } `;
  
  return (
    <div className={divClass}>
      {type === "default" && <NotFoundIcon height={52} width={56} />}
      <p className={descriptionClass}>{description}</p>
      {children}
    </div>
  );
}

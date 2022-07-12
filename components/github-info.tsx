import React from "react";

interface GithubInfoProps {
  label: string;
  color?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  variant: "user" | "repository";
  parent: "list" | "modal" | "hero";
  simpleDisabled?: boolean
}

export default function GithubInfo({
  label,
  color,
  parent,
  variant,
  disabled,
  simpleDisabled,
  active = false,
  onClick
}: GithubInfoProps) {
  function handleClick(event) {
    event.stopPropagation();

    if (!disabled) onClick?.();
  }

  function getClassName() {
    const hover = active ? "" : "-hover";
    let append = "";

    if (disabled)
      append += " text-danger border-danger bg-danger-10 cursor-now-allowed";
    else if (color)
      append += ` text-${color} border-${color} bg-${color}-10 cursor-now-allowed`;
    else if (["list", "modal"].includes(parent)) {
      append += " cursor-pointer bg-transparent text-truncate ";

      if (variant === "user")
        append +=
          " text-white text-white-hover border-gray border-white-hover bg-white-10-hover ";

      if (variant === "repository")
        append += ` text-primary border-primary text-white${hover} bg-30${hover} `;
    } else if (parent === "hero") {
      if (variant === "repository")
        append += " cursor-pointer bg-white text-primary ";
    }

    return " github-info caption-small " + append;
  }

  return (
    <div key={label} className={getClassName()} onClick={(event) => { simpleDisabled ? null : handleClick(event) }}>
      <span>{label}</span>
    </div>
  );
}

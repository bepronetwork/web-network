import TokenIconPlaceholder from "assets/icons/token-icon-placeholder";

interface TokenIconProps {
  src?: string;
}

export default function TokenIcon({
  src
} : TokenIconProps) {
  if (src)
    return <img className="rounded-circle" src={src} height="24px" width="24px" />

  return <TokenIconPlaceholder />;
}
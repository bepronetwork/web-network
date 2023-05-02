import TokenIconPlaceholder from "assets/icons/token-icon-placeholder";

interface TokenIconProps {
  src?: string;
  size?: string;
}

export default function TokenIcon({
  src,
  size = "24"
} : TokenIconProps) {
  if (src)
    return <img className="rounded-circle" src={src} height={size} width={size} />

  return <TokenIconPlaceholder height={size} width={size} />;
}
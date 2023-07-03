import EthereumIcon from "assets/icons/ethereum-icon";

interface ChainIconProps {
  src?: string;
  size?: string;
}

export default function ChainIcon({
  src,
  size = "16"
} : ChainIconProps) {
  if (src)
    return <img className="rounded-circle bg-white p-1" src={src} height={size} width={size} />

  return <EthereumIcon height={size} width={size} />;
}
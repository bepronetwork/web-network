import getConfig from "next/config";

import QuestionMarkIcon from "assets/icons/question-mark-icon";

interface ChainIconProps {
  src?: string;
  size?: string;
}

const { publicRuntimeConfig } = getConfig();

export default function ChainIcon({
  src,
  size = "18"
} : ChainIconProps) {
  const ipfsUrl = publicRuntimeConfig?.urls?.ipfs;
  if (src && ipfsUrl)
    return <img className="rounded-circle" src={`${ipfsUrl}/${src}`} height={size} width={size} />
  return <QuestionMarkIcon height={size} width={size} />;
}
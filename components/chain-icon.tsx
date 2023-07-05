import QuestionMarkIcon from "assets/icons/question-mark-icon";

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

  return <QuestionMarkIcon height={size} width={size} />;
}
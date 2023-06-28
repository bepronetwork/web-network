import ScrollTopIcon from "assets/icons/scroll-top-icon";

interface GoTopButtonViewProps {
  isVisible: boolean;
  onClick: () => void;
}

export default function GoTopButtonView({
  isVisible,
  onClick,
}: GoTopButtonViewProps) {
  if (isVisible)
    return (
      <button className="scroll-top-button" onClick={onClick}>
        <ScrollTopIcon />
      </button>
    );
  
  return <></>;
}

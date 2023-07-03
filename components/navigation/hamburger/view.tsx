import HamburgerIcon from "assets/icons/hamburger-icon";

import Button from "components/button";
import HamburgerMenu from "components/navigation/hamburger/menu/controller";

interface HamburgerButtonViewProps {
  show: boolean;
  onOpenClick: () => void;
  onCloseClick: () => void;
}

export default function HamburgerButtonView({
  show,
  onOpenClick,
  onCloseClick
}: HamburgerButtonViewProps) {
  return(
    <>
      <Button
        className="p-0 not-svg"
        transparent
        onClick={onOpenClick}
      >
        <HamburgerIcon />
      </Button>

      <HamburgerMenu
        show={show}
        onHide={onCloseClick}
      />
    </>
  );
}
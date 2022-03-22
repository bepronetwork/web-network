import { useEffect, useState } from "react";

import ScrollTopIcon from "assets/icons/scroll-top-icon";

export default function ScrollTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  function handleGoTop() {
    window.scrollTo(0, 0);
  }

  function shouldBeVisible() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20)
      setIsVisible(true);
    else setIsVisible(false);
  }

  useEffect(() => {
    window.addEventListener("scroll", shouldBeVisible, true);

    return () => {
      window.removeEventListener("scroll", shouldBeVisible);
    };
  }, []);

  return (
    <>
      {(isVisible && (
        <button className="scroll-top-button" onClick={handleGoTop}>
          <ScrollTopIcon />
        </button>
      )) || <></>}
    </>
  );
}

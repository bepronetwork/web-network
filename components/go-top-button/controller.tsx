import { useEffect, useState } from "react";

import GoTopButtonView from "components/go-top-button/view";

export default function GoTopButton() {
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
    <GoTopButtonView
      isVisible={isVisible}
      onClick={handleGoTop}
    />
  );
}

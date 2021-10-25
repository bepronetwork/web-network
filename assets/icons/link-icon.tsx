import { SVGProps, memo } from "react";

function ExternalLinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M2.17233 4.01166C1.15664 4.01166 0.333252 3.18827 0.333252 2.17258C0.333252 1.15688 1.15664 0.333496 2.17233 0.333496H19.8275C20.8432 0.333496 21.6666 1.15688 21.6666 2.17258V19.8277C21.6666 20.8434 20.8432 21.6668 19.8275 21.6668C18.8118 21.6668 17.9884 20.8434 17.9884 19.8277V6.61251L3.47276 21.1282C2.75455 21.8464 1.59011 21.8464 0.871906 21.1282C0.153701 20.41 0.153701 19.2455 0.871906 18.5273L15.3876 4.01166H2.17233Z"
          fill="currentColor"
      />
    </svg>
  );
}

export default memo(ExternalLinkIcon);


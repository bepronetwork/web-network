declare global {
  interface Window {
    ethereum: any;
  }
}

export default function isWebThreeInstalled() {
  if (typeof window !== "undefined") {
    return typeof window.ethereum !== "undefined";
  }

  return null;
}

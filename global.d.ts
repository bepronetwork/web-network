import { MetaMaskInpageProvider } from "@metamask/providers";

interface Window {
  ethereum: MetaMaskInpageProvider;
}

import {recoverTypedSignature,} from "@metamask/eth-sig-util";

import {messageFor} from "./message-for";

export default function decodeMessage(chainId, message = "", signature: string, assumedOwner: string): boolean {
  if (!signature)
    return false;

  const params = {
    signature,
    data: JSON.parse(messageFor(chainId, message)),
    version: 'V4'
  }

  return recoverTypedSignature<any, any>(params)?.toLowerCase() === assumedOwner.toLowerCase();
}
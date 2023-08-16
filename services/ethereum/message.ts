import { MessageTypes, SignTypedDataVersion, TypedMessage, recoverTypedSignature } from "@metamask/eth-sig-util";
import { jsonRpcParams } from "@taikai/dappkit";
import { Web3Connection } from "@taikai/dappkit";

import { toLower } from "helpers/string";

interface GetMessageParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface SendResponse {
  id?: string;
  jsonrpc: string;
  result: string;
}

export class EthereumMessage<T extends MessageTypes> {
  protected readonly contractName: string;

  constructor(contractName: string) {
    this.contractName = contractName;
  }

  getMessage({ chainId, message }: GetMessageParams): TypedMessage<T | MessageTypes> {
    return {
      domain: {
        chainId: +chainId,
        name: this.contractName,
        version: "1"
      },
      message: {
        contents: message,
      },
      primaryType: "Message",
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "string" }
        ],
        Message: [
          {name: "contents", type: "string"}
        ]
      }
    };
  }

  getSigner(typedMessage: TypedMessage<T | MessageTypes>, signature: string): string {
    return recoverTypedSignature<SignTypedDataVersion.V4, T | MessageTypes>({
      data: typedMessage,
      signature: signature,
      version: SignTypedDataVersion.V4
    });
  }

  decodeMessage(typedMessage: TypedMessage<T | MessageTypes>, signature: string, assumedOwner: string): boolean {
    const signer = this.getSigner(typedMessage, signature);

    return !!signer && toLower(signer) === toLower(assumedOwner);
  }

  async sendMessage(connection: Web3Connection, 
                    from: string,
                    message: TypedMessage<T | MessageTypes>): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!connection || !from || !message) {
        reject("Connection, from and message parameters can't be null");
        return;
      }

      const callback = (error: Error | null, value: SendResponse | null) => {
        if (error)
          reject(error);
        else
          resolve(value?.result);
      };
      
      try {
        connection.Web3.currentProvider
          .send(jsonRpcParams(`eth_signTypedData_v4`, [from, JSON.stringify(message)]), callback);
      } catch (e) {
        reject(e);
      }
    });
  }
}

export const ethereumMessageService = new EthereumMessage("Bepro Network");
// frontend/src/litClient.js
// Minimal Lit v3 helper for string encryption/decryption with ACC
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { createSiweMessage } from "viem/siwe";

const chain = "ethereum";

export class LitClient {
  constructor() {
    this.litNodeClient = null;
  }

  async connect() {
    if (this.litNodeClient) return;
    this.litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
    await this.litNodeClient.connect();
  }

  // Example ACC: require balance >= 0.1 ETH (replace with PolicyNFT ownership or share token)
  getACC() {
    return [
      {
        contractAddress: "",
        standardContractType: "",
        chain,
        method: "eth_getBalance",
        parameters: [":userAddress", "latest"],
        returnValueTest: { comparator: ">=", value: "100000000000000000" }
      }
    ];
  }

  async encryptText(text) {
    await this.connect();
    const acc = this.getACC();
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });

    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(text);
    const encryptedSymmetricKey = await this.litNodeClient.saveEncryptionKey({
      accessControlConditions: acc,
      symmetricKey,
      authSig,
      chain
    });

    const encryptedSymmetricKeyHex = LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16");
    const blob = await encryptedString.arrayBuffer();
    const ciphertext = Buffer.from(blob).toString("base64");
    const dataToEncryptHash = await LitJsSdk.hashString(text);
    return { ciphertext, encryptedSymmetricKey: encryptedSymmetricKeyHex, dataToEncryptHash };
  }

  async decryptText({ ciphertext, encryptedSymmetricKey, dataToEncryptHash }) {
    await this.connect();
    const acc = this.getACC();
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });

    const decrypted = await LitJsSdk.decryptToString(
      {
        accessControlConditions: acc,
        chain,
        ciphertext: Uint8Array.from(Buffer.from(ciphertext, "base64")),
        dataToEncryptHash,
        authSig,
        encryptedSymmetricKey: LitJsSdk.hexToUint8Array(encryptedSymmetricKey)
      },
      this.litNodeClient
    );

    return decrypted;
  }
}

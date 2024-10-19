import { SolanaSignInInput, SolanaSignInOutput } from '@solana/wallet-standard-features';
import { createSignInMessage } from '@solana/wallet-standard-util';
import { Keypair, PublicKey, SendOptions, Transaction, TransactionSignature, VersionedTransaction } from '@solana/web3.js';
import { initialize, SpiralSafe as ISpiralSafe, SpiralSafeEvent } from '@spiralsafe/wallet-adapter';
import nacl from 'tweetnacl';

console.log("Inject Script Running");

export class SpiralSafe implements ISpiralSafe {
    constructor() {
        console.log("SpiralSafe Constructor");
        if (new.target === SpiralSafe) {
            Object.freeze(this);
        }
        this.#keypair = new Keypair();
        this.#isConnected = false;
    }
    #keypair?: Keypair;
    #isConnected: boolean;

    public get publicKey() {
        console.log("Public Key", this.#keypair?.publicKey);
        return this.#keypair?.publicKey ?? null;
    }

    connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: PublicKey }> {
        console.log("Connect", options);
        if (this.#keypair?.publicKey) {
            this.#connect(this.#keypair.publicKey.toBase58(), "");
            return Promise.resolve({ publicKey: this.#keypair.publicKey });
        }
        return Promise.resolve({ publicKey: new Keypair().publicKey });
    }
    #connect(publicKey: string, connectionUrl: string) {
        console.log("Connect", publicKey, connectionUrl);
        this.#isConnected = true;
    }

    disconnect(): Promise<void> {
        console.log("Disconnect");
        this.#isConnected = false;
        return Promise.resolve();
    }
    signAndSendTransaction<T extends Transaction | VersionedTransaction>(
        transaction: T,
        options?: SendOptions
    ): Promise<{ signature: TransactionSignature }> {
        console.log("Sign Transaction", transaction);
        return Promise.resolve({ signature: "" as any })
    }
    signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
        console.log("Sign Transaction", transaction);
        return Promise.resolve(transaction);
    }
    signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
        console.log("Sign All Transactions", transactions);
        return Promise.resolve(transactions);
    }
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }> {
        console.log("Sign Message", message);
        return Promise.resolve({ signature: "" as any });
    }
    async signIn(input?: SolanaSignInInput): Promise<SolanaSignInOutput> {
        console.log("Sign In", input);
        // Send a message to the extension to open the extension page
        window.postMessage(
            {
                type: "OPEN_EXTENSION_PAGE",
                sender: "spiralSafe",
                payload: input,
            },
            "*"
        );

        // Return a Promise that resolves when the response is received from the extension
        return new Promise((resolve, reject) => {
            const handleMessage = (event: MessageEvent) => {
                console.log("handleMessage", event);
                // Verify that the message is from the extension
                if (event.source !== window) return;

                const message = event.data;
                // Check the message type and sender
                if (
                    message &&
                    message.type === "SPIRALSAFE_KEYPAIR_RESPONSE" &&
                    message.sender === "spiralSafeExtension"
                ) {
                    // Extract the keypair data from the message payload
                    console.log("received keypair", new Uint8Array(message.payload).length);
                    this.#keypair = Keypair.fromSecretKey(new Uint8Array(message.payload));

                    const domain = input?.domain || window.location.host;
                    const address = input?.address || this.#keypair.publicKey.toBase58();

                    // Create a signed message
                    const signedMessage = createSignInMessage({
                        ...input,
                        domain,
                        address,
                    });
                    const signature = nacl.sign.detached(signedMessage, this.#keypair.secretKey);

                    this.#connect(address, "");

                    // Resolve the promise with the sign-in output
                    resolve({
                        account: {
                            address,
                            publicKey: this.#keypair.publicKey.toBytes(),
                            chains: [],
                            features: [],
                        },
                        signedMessage,
                        signature,
                    });
                    window.removeEventListener("message", handleMessage);
                }
            };

            // Add an event listener to listen for messages from the extension
            window.addEventListener("message", handleMessage);

            // Optional: Set a timeout to reject the promise if no response is received
            setTimeout(() => {
                window.removeEventListener("message", handleMessage);
                reject(new Error("Timeout waiting for keypair response from extension"));
            }, 30000); // Timeout after 30 seconds
        });
    }

    on<E extends keyof SpiralSafeEvent>(event: E, listener: SpiralSafeEvent[E], context?: any): void {
        console.log("On", event, listener, context);
    }
    off<E extends keyof SpiralSafeEvent>(event: E, listener: SpiralSafeEvent[E], context?: any): void {
        console.log("Off", event, listener, context);
    }
}

console.log("Inject Script Initializing");
const spiralSafe = new SpiralSafe();
try {
    Object.defineProperty(window, 'spiralSafe', { value: spiralSafe });
}
catch (error) {
    console.error(error);
}
initialize(spiralSafe);

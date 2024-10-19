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
        const { publicKey, secretKey } = (this.#keypair ||= new Keypair());
        const domain = input?.domain || window.location.host;
        const address = input?.address || publicKey.toBase58();

        const signedMessage = createSignInMessage({
            ...input,
            domain,
            address,
        });
        const signature = nacl.sign.detached(signedMessage, secretKey);

        this.#connect(address, "");

        return {
            account: {
                address,
                publicKey: publicKey.toBytes(),
                chains: [],
                features: [],
            },
            signedMessage,
            signature,
        };
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
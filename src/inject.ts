import { SolanaSignInInput, SolanaSignInOutput } from '@solana/wallet-standard-features';
import { Keypair, PublicKey, SendOptions, Transaction, TransactionSignature, VersionedTransaction } from '@solana/web3.js';
import { initialize, SpiralSafe as ISpiralSafe, SpiralSafeEvent } from '@spiralsafe/wallet-adapter';

console.log("Inject Script Running");

export class SpiralSafe implements ISpiralSafe {
    constructor() {
        if (new.target === SpiralSafe) {
            Object.freeze(this);
        }
        this.#publicKey = (new Keypair()).publicKey;
        this.#isConnected = false;
    }
    #publicKey?: PublicKey;
    #isConnected: boolean;

    public get publicKey() {
        return this.#publicKey ?? null;
    }

    connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: PublicKey }> {
        if (this.#publicKey) {
            this.#connect((this.#publicKey as PublicKey).toBase58(), "");
            return Promise.resolve({ publicKey: this.#publicKey as PublicKey });
        }
        return Promise.resolve({ publicKey: new Keypair().publicKey });
    }
    #connect(publicKey: string, connectionUrl: string) {
        this.#isConnected = true;
        this.#publicKey = new PublicKey(publicKey);
    }
    disconnect(): Promise<void> {
        return Promise.resolve();
    }
    signAndSendTransaction<T extends Transaction | VersionedTransaction>(
        transaction: T,
        options?: SendOptions
    ): Promise<{ signature: TransactionSignature }> {
        return Promise.resolve({ signature: "" as any })
    }
    signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
        return Promise.resolve(transaction);
    }
    signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
        return Promise.resolve(transactions);
    }
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }> {
        return Promise.resolve({ signature: "" as any });
    }
    signIn(input?: SolanaSignInInput): Promise<SolanaSignInOutput> {
        return Promise.resolve({} as any)
    }

    on<E extends keyof SpiralSafeEvent>(event: E, listener: SpiralSafeEvent[E], context?: any): void {

    }
    off<E extends keyof SpiralSafeEvent>(event: E, listener: SpiralSafeEvent[E], context?: any): void {

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
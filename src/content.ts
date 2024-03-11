import { SolanaSignInInput, SolanaSignInOutput } from '@solana/wallet-standard-features';
import { Keypair, PublicKey, SendOptions, Transaction, TransactionSignature, VersionedTransaction } from '@solana/web3.js';
import { initialize } from '@spiralsafe/wallet-adapter';
import { SpiralSafe as ISpiralSafe, SpiralSafeEvent } from '@spiralsafe/wallet-adapter';

class SpiralSafe implements ISpiralSafe {
    constructor() {
        this.publicKey = Keypair.generate().publicKey
    }
    publicKey: PublicKey | null;
    connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: PublicKey }> {
        return Promise.resolve({ publicKey: this.publicKey as PublicKey });
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

const spiralSafe = new SpiralSafe();
initialize(spiralSafe);
try {
    Object.defineProperty(window, 'spiralSafe', { value: spiralSafe });
}
catch (error) {
    console.error(error);
}
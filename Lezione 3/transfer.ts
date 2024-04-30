import { 
    Keypair, 
    Connection, 
    LAMPORTS_PER_SOL,
    SystemProgram, 
    Transaction, 
    sendAndConfirmTransaction, 
    PublicKey 
} from "@solana/web3.js";

// Importiamo la chiave privata del nostro wallet che abbiamo salvato dopo aver eseguito il comando "yarn keygen"
import wallet from "./<wallet-name>.json";

// Creiamo una nuova connessione con il cluster di devnet di Solana
const connection = new Connection("https://api.devnet.solana.com", "finalized");

// Creiamo una nuova istanza di Keypair passando la chiave privata del nostro wallet come argomento
const from = Keypair.fromSecretKey(new Uint8Array(wallet));

// Indirizzo del wallet a cui inviare i fondi, deve essere di tipo PublicKey
const to = new PublicKey("oe2BgEdGPSaNLMg9vi13cNwH9iWrAxsoHbELxR24HeS");

/*
    Transfer:
    --------------------------------
    transfer(
        fromPubkey: PublicKey, 
        toPubkey: PublicKey, 
        lamports: number
    ): TransactionInstruction;

    - fromPubkey: Indirizzo del wallet mittente (deve firmare la transazione)
    - toPubkey: Indirizzo del wallet destinatario
    - lamports: Quantità di SOL da trasferire (1 SOL = 1_000_000_000 LAMPORTS)

    Transaction:
    --------------------------------
    .add(instruction: TransactionInstruction) => Add an instruction to this transaction
    .feePayer: PublicKey => The account that will pay the transaction fee
    .sign(Array<Signer>) => Define the account that will sign the transaction

    or you can use the sendAndConfirmTransaction method to send the transaction and specify all the necessary parameters there

    SendAndConfirmTransaction:
    --------------------------------
    sendAndConfirmTransaction(
        connection: Connection, 
        transaction: Transaction, 
        signers: Array<Signer>, 
        options?: SendOptions
    ): Promise<TransactionSignature>;
*/

(async () => {
    try {
        // Creiamo una nuova instruzione per trasferire 0.5 SOL
        const transferInstruction = SystemProgram.transfer({
            fromPubkey: from.publicKey,             // Indirizzo del wallet mittente (deve firmare la transazione)
            toPubkey: to,                           // Indirizzo del wallet destinatario
            lamports: 0.5 * LAMPORTS_PER_SOL        // Quantità di SOL da trasferire (0.5 SOL = 500_000_000 LAMPORTS)
        });

        // Creiamo una nuova transazione e aggiungiamo l'istruzione di trasferimento
        const transaction = new Transaction().add(transferInstruction);

        // Definiamo l'account che paga
        transaction.feePayer = from.publicKey;

        // Firmiamo la transazione con la chiave privata del nostro wallet e inviamo la transazione
        const txHash = await sendAndConfirmTransaction(connection, transaction, [from], { commitment: "finalized", skipPreflight: false });

        // Attendiamo la conferma della transazione e poi logghiamao il link alla transazione sull'explorer di Solana
        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${txHash}?cluster=devnet`);
    } catch (error) {
        console.error(error);
    }
})();
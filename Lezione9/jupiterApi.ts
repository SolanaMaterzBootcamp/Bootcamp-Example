import { Connection, Keypair, PublicKey, VersionedTransaction, TransactionInstruction, AddressLookupTableAccount, TransactionMessage } from '@solana/web3.js';
import { BN } from "@project-serum/anchor"

import fetch from 'cross-fetch';

import wallet from "../wallet.json";

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
const connection = new Connection("https://api.devnet.solana.com", "finalized");

(async () => {
    const quoteResponse = await (
        await fetch('https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112\&outputMint=HqLRjru6pD6GFGnQ7TwSSGQRuPhF8UZNey9T4yCsZzuq\&amount=20000\&slippageBps=100\&onlyDirectRoutes=false')
    ).json();

    console.log(quoteResponse);

    const instructions = await (
        await fetch('https://quote-api.jup.ag/v6/swap-instructions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quoteResponse,
                userPublicKey: keypair.publicKey.toBase58(),
            })
        })
    ).json();
    
    if (instructions.error) {
        throw new Error("Failed to get swap instructions: " + instructions.error);
    }

    const {
        tokenLedgerInstruction, // If you are using `useTokenLedger = true`.
        computeBudgetInstructions, // The necessary instructions to setup the compute budget.
        setupInstructions, // Setup missing ATA for the users.
        swapInstruction: swapInstructionPayload, // The actual swap instruction.
        cleanupInstruction, // Unwrap the SOL if `wrapAndUnwrapSol = true`.
        addressLookupTableAddresses, // The lookup table addresses that you can use if you are using versioned transaction.
    } = instructions;
    
    const deserializeInstruction = (instruction: any) => {
        return new TransactionInstruction({
        programId: new PublicKey(instruction.programId),
        keys: instruction.accounts.map((key: any) => ({
            pubkey: new PublicKey(key.pubkey),
            isSigner: key.isSigner,
            isWritable: key.isWritable,
        })),
        data: Buffer.from(instruction.data, "base64"),
        });
    };
    
    const getAddressLookupTableAccounts = async (
        keys: string[]
    ): Promise<AddressLookupTableAccount[]> => {
        const addressLookupTableAccountInfos =
        await connection.getMultipleAccountsInfo(
            keys.map((key) => new PublicKey(key))
        );
    
        return addressLookupTableAccountInfos.reduce((acc, accountInfo, index) => {
        const addressLookupTableAddress = keys[index];
        if (accountInfo) {
            const addressLookupTableAccount = new AddressLookupTableAccount({
            key: new PublicKey(addressLookupTableAddress),
            state: AddressLookupTableAccount.deserialize(accountInfo.data),
            });
            acc.push(addressLookupTableAccount);
        }
    
        return acc;
        }, new Array<AddressLookupTableAccount>());
    };
    
    const addressLookupTableAccounts: AddressLookupTableAccount[] = [];
    
    addressLookupTableAccounts.push(
        ...(await getAddressLookupTableAccounts(addressLookupTableAddresses))
    );

    // const blockhash = (await connection.getLatestBlockhash()).blockhash;
    // const messageV0 = new TransactionMessage({
    //     payerKey: keypair.publicKey,
    //     recentBlockhash: blockhash,
    //     instructions: [
    //         ...setupInstructions.map(deserializeInstruction),
    //         deserializeInstruction(swapInstructionPayload),
    //     ],
    // }).compileToV0Message(addressLookupTableAccounts);

    // const transaction = new VersionedTransaction(messageV0);
    // transaction.sign([keypair]);

    // try {
    //     const txid = await connection.sendTransaction(transaction);
    //     console.log(`https://explorer.solana.com/tx/${txid}`);
    // } catch (e) {
    //     console.log(e);
    //     throw e;
    // }
})();
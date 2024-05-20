import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createMetadataAccountV3, CreateMetadataAccountV3InstructionArgs, CreateMetadataAccountV3InstructionAccounts, DataV2Args, MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { publicKey as publicKeySerializer, string} from '@metaplex-foundation/umi/serializers';
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

import wallet from "../wallet.json";

const umi = createUmi("https://api.devnet.solana.com", "finalized")

let keyair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keyair);
umi.use(signerIdentity(myKeypairSigner)).use(irysUploader());

(async () => {

    const metadata = {
        name: "MasterZ NFT",
        symbol: "MZT",
        description: "NFT di esempio per il corso di Blockchain MasterZ",
        image: "https://arweave.net/9AXtb2s4JBRoQ_y95OUwUTp5rKCMs4w1IYbPhoJOypg",
        attributes: [
            {
                trait_type: "Rarity",
                value: "Common"
            },
            {
                trait_type: "Author",
                value: "MasterZ"
            }
        ],
        proprieties: {
            files: [
                {
                    type: "image/jpeg",
                    uri: "https://arweave.net/9AXtb2s4JBRoQ_y95OUwUTp5rKCMs4w1IYbPhoJOypg"
                }
            ]
        }
    }

    const nftUri = await umi.uploader.uploadJson(metadata);
    console.log("Your Uri:", nftUri);
})();
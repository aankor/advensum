import { encode } from "@coral-xyz/anchor/dist/cjs/utils/bytes/utf8";
import { PublicKey } from "@solana/web3.js";

export function minterAddress({
    programId,
    world,
}: {
    programId: PublicKey;
    world: PublicKey;
}) {
    return PublicKey.findProgramAddressSync([
        encode('minter'),
        world.toBytes(),
    ], programId)[0]
}
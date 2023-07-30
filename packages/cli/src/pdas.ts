import { PublicKey } from "@solana/web3.js";

export function minterAddress({
    programId,
    world,
}: {
    programId: PublicKey;
    world: PublicKey;
}) {
    return PublicKey.findProgramAddressSync([
        Buffer.from('minter', "utf-8"),
        world.toBytes(),
    ], programId)[0]
}

export function characterAddress({
    programId,
    nftMint,
}: {
    programId: PublicKey;
    nftMint: PublicKey;
}) {
    return PublicKey.findProgramAddressSync([
        Buffer.from('address', "utf-8"),
        nftMint.toBytes(),
    ], programId)[0]
}

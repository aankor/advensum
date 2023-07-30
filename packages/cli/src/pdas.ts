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
/*
export function characterKindAddress({
    programId,
    collectionMint,
}: {
    programId: PublicKey;
    collectionMint: PublicKey;
}) {
    return PublicKey.findProgramAddressSync([
        Buffer.from('address', "utf-8"),
        collectionMint.toBytes(),
    ], programId)[0]
}
*/
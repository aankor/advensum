import { PublicKey } from "@solana/web3.js";
import {Buffer} from 'buffer';

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
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct WorldBumps {
    pub minter: u8,
}
#[account]
pub struct World {
    pub admin: Pubkey,
    pub treasury_mint: Pubkey,
    pub energy_mint: Pubkey,
    pub energy_price: u64,
    pub summonite_mint: Pubkey,
    pub summonite_price: u64,
    pub treasury: Pubkey,
    pub character_count: u64,
    pub bumps: WorldBumps,
    pub banner_count: u64,
    pub characters_collection: Pubkey,
}

#[constant]
pub const MINTER_SEED: &'static [u8] = b"minter";
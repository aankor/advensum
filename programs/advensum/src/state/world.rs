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
    pub stage_count: u32,
    pub stage_line_starts: Vec<Pubkey>,
}

#[constant]
pub const MINTER_SEED: &'static [u8] = b"minter";
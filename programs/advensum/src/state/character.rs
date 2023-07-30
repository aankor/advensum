use anchor_lang::prelude::*;

#[account]
pub struct Character {
    pub world: Pubkey,
    pub level: u64,
    pub hp: u32,
    pub attack: u32,
    pub mint: Pubkey,
}
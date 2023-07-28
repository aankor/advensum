use anchor_lang::prelude::*;

#[account]
pub struct World {
    pub admin: Pubkey,
    pub stage_count: u32,
    pub stage_line_starts: Vec<Pubkey>, 
}
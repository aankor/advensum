use anchor_lang::prelude::*;

#[account]
pub struct Stage {
    pub line_index: u32,
    pub index_in_line: u32,
    pub required: Option<Pubkey>,
}
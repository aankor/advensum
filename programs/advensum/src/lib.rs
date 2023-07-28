use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;
use instructions::*;

declare_id!("2piq3bnT1wuDTNUfQMhuvaV2XUhRQheHCDCA8ASAhHh9");

#[program]
pub mod advensum {
    use super::*;

    pub fn init_world(ctx: Context<InitWorld>, admin: Pubkey) -> Result<()> {
        ctx.accounts.process(admin)
    }
}


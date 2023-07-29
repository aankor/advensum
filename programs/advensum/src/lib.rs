use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;
use instructions::*;

declare_id!("advsL9SKEkFZT5XipM78A8Y2bUomYWf9dvLJWBEzrn1");

#[program]
pub mod advensum {
    use crate::state::world::WorldBumps;

    use super::*;

    pub fn init_world(ctx: Context<InitWorld>, admin: Pubkey) -> Result<()> {
        ctx.accounts.process(admin, WorldBumps {
            minter: *ctx.bumps.get("minter").unwrap()
        })
    }

    pub fn mint_energy(ctx: Context<MintEnergy>, amount: u64) -> Result<()> {
        ctx.accounts.process(amount)
    }

    pub fn mint_summonite(ctx: Context<MintSummonite>, amount: u64) -> Result<()> {
        ctx.accounts.process(amount)
    }
}


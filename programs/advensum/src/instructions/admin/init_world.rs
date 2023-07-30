use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount, Mint, Token};

use crate::state::world::{World, WorldBumps, MINTER_SEED};

#[derive(Accounts)]
pub struct InitWorld<'info> {
    #[account(
        init,
        payer = payer,
        space = 10240
    )]
    pub world: Account<'info, World>,
    pub treasury: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = minter,
    )]
    pub energy_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = minter,
    )]
    pub summonite_mint: Account<'info, Mint>,

    /// CHECK: PDA
    #[account(
        seeds = [
            MINTER_SEED,
            &world.key().to_bytes(),
        ],
        bump,
    )]
    pub minter: UncheckedAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

impl<'info> InitWorld<'info> {
    pub fn process(&mut self, admin: Pubkey, bumps: WorldBumps) -> Result<()> {
        self.world.set_inner(World {
            admin,
            treasury_mint: self.treasury.mint,
            energy_mint: self.energy_mint.key(),
            energy_price: 1000,
            summonite_mint: self.summonite_mint.key(),
            summonite_price: 1000,
            treasury: self.treasury.key(),
            bumps,
            character_count: 0,
            banner_count: 0,
            characters_collection: Pubkey::default(),
        });
        Ok(())
    }
}

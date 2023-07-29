use anchor_lang::prelude::*;
use anchor_spl::token::{mint_to, transfer, Mint, MintTo, Token, TokenAccount, Transfer};

use crate::state::world::{World, MINTER_SEED};

#[derive(Accounts)]
pub struct MintSummonite<'info> {
    #[account(
        has_one = summonite_mint,
        has_one = treasury,
    )]
    pub world: Account<'info, World>,
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
    pub summonite_mint: Account<'info, Mint>,
    #[account(mut)]
    pub treasury: Account<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = world.treasury_mint,
    )]
    pub pay_from: Account<'info, TokenAccount>,
    pub payer: Signer<'info>,
    #[account(
        mut,
        token::mint = summonite_mint,
    )]
    pub mint_to: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

impl<'info> MintSummonite<'info> {
    pub fn process(&mut self, amount: u64) -> Result<()> {
        let payment = self.world.summonite_price * amount;
        transfer(
            CpiContext::new(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.pay_from.to_account_info(),
                    to: self.treasury.to_account_info(),
                    authority: self.payer.to_account_info(),
                },
            ),
            payment,
        )?;
        mint_to(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                MintTo {
                    mint: self.summonite_mint.to_account_info(),
                    to: self.mint_to.to_account_info(),
                    authority: self.minter.to_account_info(),
                },
                &[&[
                    MINTER_SEED,
                    &self.world.key().to_bytes(),
                    &[self.world.bumps.minter],
                ]],
            ),
            amount,
        )?;
        Ok(())
    }
}

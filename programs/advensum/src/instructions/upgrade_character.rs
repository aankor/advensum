use anchor_lang::prelude::*;
use anchor_spl::token::{burn, Burn, Mint, Token, TokenAccount};

use crate::state::{character::Character, world::World, ADDRESS_SEED};

#[derive(Accounts)]
pub struct UpgradeCharacter<'info> {
    #[account(mut)]
    pub world: Box<Account<'info, World>>,

    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [
            ADDRESS_SEED,
            &character_mint.key().to_bytes(),
        ],
        bump,
        has_one = world,
    )]
    pub character: Box<Account<'info, Character>>,

    pub character_mint: Box<Account<'info, Mint>>,
    #[account(
        token::mint = character_mint,
        token::authority = owner,
        constraint = character_token.amount == 1
    )]
    pub character_token: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [
            ADDRESS_SEED,
            &material_mint.key().to_bytes(),
        ],
        bump,
        close = rent_collector,
        has_one = world,
    )]
    pub material: Box<Account<'info, Character>>,

    #[account(mut)]
    pub material_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        token::mint = material_mint,
        token::authority = owner,
        constraint = material_token.amount == 1
    )]
    pub material_token: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub rent_collector: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

impl<'info> UpgradeCharacter<'info> {
    pub fn process(&mut self) -> Result<()> {
        self.character.attack = self.character.attack.max(
            self.material.attack
        );
        self.character.hp = self.character.hp.max(
            self.material.hp
        );
        self.character.level += self.material.level; // TODO some formula
        burn(
            CpiContext::new(
                self.token_program.to_account_info(),
                Burn {
                    mint: self.material_mint.to_account_info(),
                    from: self.material_token.to_account_info(),
                    authority: self.owner.to_account_info(),
                },
            ),
            1,
        )?;
        self.world.character_count = self.world.character_count.saturating_sub(1);
        Ok(())
    }
}

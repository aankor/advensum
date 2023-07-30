use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3, CreateMasterEditionV3,
        CreateMetadataAccountsV3, Metadata,
    },
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};
use mpl_token_metadata::state::{Creator, DataV2};

use crate::state::world::{World, MINTER_SEED};

#[derive(Accounts)]
pub struct SetCharactersCollection<'info> {
    #[account(
        mut,
        has_one = admin,
    )]
    pub world: Box<Account<'info, World>>,
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = minter,
        mint::freeze_authority = minter,
    )]
    pub collection_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = payer,
        associated_token::authority = admin,
        associated_token::mint = collection_mint,
    )]
    pub collection_token: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [
            mpl_token_metadata::state::PREFIX.as_bytes(),
            mpl_token_metadata::ID.as_ref(),
            collection_mint.key().as_ref()
        ],
        bump,
        seeds::program = mpl_token_metadata::ID,
    )]
    pub metadata: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [
            mpl_token_metadata::state::PREFIX.as_bytes(),
            mpl_token_metadata::ID.as_ref(),
            collection_mint.key().as_ref(),
            mpl_token_metadata::state::EDITION.as_bytes(),
        ],
        bump,
        seeds::program = mpl_token_metadata::ID,
    )]
    pub master_edition: SystemAccount<'info>,

    /// CHECK: PDA
    #[account(
        seeds = [
            MINTER_SEED,
            &world.key().to_bytes(),
        ],
        bump = world.bumps.minter,
    )]
    pub minter: UncheckedAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub rent: Sysvar<'info, Rent>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, Metadata>,
}

impl<'info> SetCharactersCollection<'info> {
    pub fn process(&mut self, name: String, symbol: String, uri: String) -> Result<()> {
        mint_to(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                MintTo {
                    mint: self.collection_mint.to_account_info(),
                    to: self.collection_token.to_account_info(),
                    authority: self.minter.to_account_info(),
                },
                &[&[
                    MINTER_SEED,
                    &self.world.key().to_bytes(),
                    &[self.world.bumps.minter],
                ]],
            ),
            1,
        )?;
        create_metadata_accounts_v3(
            CpiContext::new_with_signer(
                self.metadata_program.to_account_info(),
                CreateMetadataAccountsV3 {
                    metadata: self.metadata.to_account_info(),
                    mint: self.collection_mint.to_account_info(),
                    mint_authority: self.minter.to_account_info(),
                    payer: self.payer.to_account_info(),
                    update_authority: self.minter.to_account_info(),
                    system_program: self.system_program.to_account_info(),
                    rent: self.rent.to_account_info(),
                },
                &[&[
                    MINTER_SEED,
                    &self.world.key().to_bytes(),
                    &[self.world.bumps.minter],
                ]],
            ),
            DataV2 {
                name,
                symbol,
                uri,
                seller_fee_basis_points: 0,
                creators: Some(vec![Creator {
                    address: self.minter.key(),
                    verified: true,
                    share: 100,
                }]),
                collection: None,
                uses: None,
            },
            true,
            true,
            None,
        )?;

        create_master_edition_v3(
            CpiContext::new_with_signer(
                self.metadata_program.to_account_info(),
                CreateMasterEditionV3 {
                    edition: self.master_edition.to_account_info(),
                    mint: self.collection_mint.to_account_info(),
                    update_authority: self.minter.to_account_info(),
                    mint_authority: self.minter.to_account_info(),
                    payer: self.payer.to_account_info(),
                    metadata: self.metadata.to_account_info(),
                    token_program: self.token_program.to_account_info(),
                    system_program: self.system_program.to_account_info(),
                    rent: self.rent.to_account_info(),
                },
                &[&[
                    MINTER_SEED,
                    &self.world.key().to_bytes(),
                    &[self.world.bumps.minter],
                ]],
            ),
            Some(0),
        )?;

        self.world.characters_collection = self.collection_mint.key();

        Ok(())
    }
}

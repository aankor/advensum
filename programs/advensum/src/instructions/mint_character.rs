use crate::state::{
    banner::Banner,
    character::Character,
    world::{World, MINTER_SEED},
    ADDRESS_SEED,
};
use anchor_lang::{prelude::*, solana_program::sysvar::recent_blockhashes::RecentBlockhashes};
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3, verify_collection,
        CreateMasterEditionV3, CreateMetadataAccountsV3, MasterEditionAccount, Metadata,
        MetadataAccount, VerifyCollection,
    },
    token::{burn, mint_to, Burn, Mint, MintTo, Token, TokenAccount},
};
use arrayref::array_ref;
use mpl_token_metadata::state::{Collection, Creator, DataV2};

#[derive(Accounts)]
pub struct MintCharacter<'info> {
    #[account(
        has_one = world,
    )]
    pub banner: Box<Account<'info, Banner>>,
    #[account(
        has_one = characters_collection,
        has_one = summonite_mint,
    )]
    pub world: Box<Account<'info, World>>,
    pub owner: Signer<'info>,
    #[account(
        init,
        seeds = [
            ADDRESS_SEED,
            &character_mint.key().to_bytes(),
        ],
        bump,
        payer = payer,
        space = 10240,
    )]
    pub character: Box<Account<'info, Character>>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = minter,
        mint::freeze_authority = minter,
    )]
    pub character_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = payer,
        associated_token::authority = owner,
        associated_token::mint = character_mint,
    )]
    pub character_token: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [
            mpl_token_metadata::state::PREFIX.as_bytes(),
            mpl_token_metadata::ID.as_ref(),
            character_mint.key().as_ref()
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
            character_mint.key().as_ref(),
            mpl_token_metadata::state::EDITION.as_bytes(),
        ],
        bump,
        seeds::program = mpl_token_metadata::ID,
    )]
    pub master_edition: SystemAccount<'info>,

    /// CHECK: PDA
    #[account(
        mut,
        seeds = [
            MINTER_SEED,
            &world.key().to_bytes(),
        ],
        bump = world.bumps.minter,
    )]
    pub minter: UncheckedAccount<'info>,

    #[account(mut)]
    pub summonite_mint: Box<Account<'info, Mint>>,
    #[account(
        mut,
        token::mint = summonite_mint,
    )]
    pub summonite_source: Box<Account<'info, TokenAccount>>,

    pub characters_collection: Box<Account<'info, Mint>>,
    #[account(
        seeds = [
            mpl_token_metadata::state::PREFIX.as_bytes(),
            mpl_token_metadata::ID.as_ref(),
            characters_collection.key().as_ref()
        ],
        bump,
        seeds::program = mpl_token_metadata::ID,
    )]
    pub characters_collection_metadata: Account<'info, MetadataAccount>,
    #[account(
        mut,
        seeds = [
            mpl_token_metadata::state::PREFIX.as_bytes(),
            mpl_token_metadata::ID.as_ref(),
            characters_collection.key().as_ref(),
            mpl_token_metadata::state::EDITION.as_bytes(),
        ],
        bump,
        seeds::program = mpl_token_metadata::ID,
    )]
    pub characters_collection_master_edition: Account<'info, MasterEditionAccount>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub rent: Sysvar<'info, Rent>,
    pub recent_blockhashes: Sysvar<'info, RecentBlockhashes>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, Metadata>,
}

impl<'info> MintCharacter<'info> {
    pub fn process(&mut self) -> Result<()> {
        burn(
            CpiContext::new(
                self.token_program.to_account_info(),
                Burn {
                    mint: self.summonite_mint.to_account_info(),
                    from: self.summonite_source.to_account_info(),
                    authority: self.owner.to_account_info(),
                },
            ),
            self.banner.summonite_cost,
        )?;

        let clock = Clock::get()?;
        let garbage = self.recent_blockhashes.last().unwrap().blockhash.to_bytes();

        let random1 = u32::from_le_bytes(*array_ref!(garbage, 0, 4))
            ^ (clock.unix_timestamp % (u32::MAX as i64 + 1)) as u32;
        let random2 = u32::from_le_bytes(*array_ref!(garbage, 4, 4))
            ^ (clock.unix_timestamp % (u32::MAX as i64 + 1)) as u32;
        let random3 = u32::from_le_bytes(*array_ref!(garbage, 8, 4))
            ^ (clock.unix_timestamp % (u32::MAX as i64 + 1)) as u32;

        let index = random1 as usize % self.banner.character_templates.len();
        let hp = self.banner.character_templates[index].min_hp
            + (((self.banner.character_templates[index].max_hp
                - self.banner.character_templates[index].min_hp) as u64
                * random2 as u64)
                / (u32::MAX as u64 + 1)) as u32;
        let attack = self.banner.character_templates[index].min_attack
            + (((self.banner.character_templates[index].max_attack
                - self.banner.character_templates[index].min_attack) as u64
                * random3 as u64)
                / (u32::MAX as u64 + 1)) as u32;
        msg!("Minting char {} with hp {} attack {}", index, hp, attack);

        mint_to(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                MintTo {
                    mint: self.character_mint.to_account_info(),
                    to: self.character_token.to_account_info(),
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
                    mint: self.character_mint.to_account_info(),
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
                name: self.banner.character_templates[index].name.clone(),
                symbol: self.characters_collection_metadata.data.symbol.clone(),
                uri: self.banner.character_templates[index].uri.clone(),
                seller_fee_basis_points: 0,
                creators: Some(vec![Creator {
                    address: self.minter.key(),
                    verified: true,
                    share: 100,
                }]),
                collection: Some(Collection {
                    verified: false,
                    key: self.characters_collection.key(),
                }),
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
                    mint: self.character_mint.to_account_info(),
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

        verify_collection(
            CpiContext::new_with_signer(
                self.metadata_program.to_account_info(),
                VerifyCollection {
                    payer: self.payer.to_account_info(),
                    metadata: self.metadata.to_account_info(),
                    collection_authority: self.minter.to_account_info(),
                    collection_mint: self.characters_collection.to_account_info(),
                    collection_metadata: self.characters_collection_metadata.to_account_info(),
                    collection_master_edition: self
                        .characters_collection_master_edition
                        .to_account_info(),
                },
                &[&[
                    MINTER_SEED,
                    &self.world.key().to_bytes(),
                    &[self.world.bumps.minter],
                ]],
            ),
            None,
        )?;

        self.character.set_inner(Character {
            world: self.world.key(),
            level: 1,
            hp,
            attack,
            mint: self.character_mint.key(),
        });
        self.world.character_count += 1;

        Ok(())
    }
}

use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
use instructions::*;

declare_id!("advsQ6WNSh5Fvsf1FxtLwFUV4ibxFa3GiF4Ko9zn5Ww");

#[program]
pub mod advensum {
    use crate::state::world::WorldBumps;

    use super::*;

    pub fn init_world(ctx: Context<InitWorld>, admin: Pubkey) -> Result<()> {
        ctx.accounts.process(
            admin,
            WorldBumps {
                minter: *ctx.bumps.get("minter").unwrap(),
            },
        )
    }

    pub fn mint_energy(ctx: Context<MintEnergy>, amount: u64) -> Result<()> {
        ctx.accounts.process(amount)
    }

    pub fn mint_summonite(ctx: Context<MintSummonite>, amount: u64) -> Result<()> {
        ctx.accounts.process(amount)
    }

    pub fn init_banner(
        ctx: Context<InitBanner>,
        name: String,
        image: String,
        summonite_cost: u64,
    ) -> Result<()> {
        ctx.accounts.process(name, image, summonite_cost)
    }

    pub fn add_banner_item(
        ctx: Context<AddBannerItem>,
        name: String,
        uri: String,
        probability: u32,
        min_hp: u32,
        max_hp: u32,
        min_attack: u32,
        max_attack: u32,
    ) -> Result<()> {
        ctx.accounts.process(
            name,
            uri,
            probability,
            (min_hp, max_hp),
            (min_attack, max_attack),
        )
    }

    pub fn set_characters_collection(
        ctx: Context<SetCharactersCollection>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        ctx.accounts.process(name, symbol, uri)
    }

    pub fn mint_character(ctx: Context<MintCharacter>) -> Result<()> {
        ctx.accounts.process()
    }
}

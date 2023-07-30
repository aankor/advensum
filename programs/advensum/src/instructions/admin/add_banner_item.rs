use anchor_lang::prelude::*;

use crate::state::{
    banner::{Banner, CharacterTemplate},
    world::World,
};

#[derive(Accounts)]
pub struct AddBannerItem<'info> {
    #[account(
        has_one = admin,
    )]
    pub world: Box<Account<'info, World>>,
    pub admin: Signer<'info>,
    #[account(
        mut,
        has_one = world,
    )]
    pub banner: Box<Account<'info, Banner>>,
}

impl<'info> AddBannerItem<'info> {
    pub fn process(
        &mut self,
        name: String,
        uri: String,
        probability: u32,
        (min_hp, max_hp): (u32, u32),
        (min_attack, max_attack): (u32, u32),
    ) -> Result<()> {
        self.banner.character_templates.push(CharacterTemplate {
            probability,
            min_hp,
            max_hp,
            min_attack,
            max_attack,
            name,
            uri,
        });
        Ok(())
    }
}

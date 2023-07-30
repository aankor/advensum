use crate::state::{banner::Banner, world::World};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitBanner<'info> {
    #[account(
        mut,
        has_one = admin,
    )]
    pub world: Box<Account<'info, World>>,
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = 10240,
    )]
    pub banner: Box<Account<'info, Banner>>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitBanner<'info> {
    pub fn process(&mut self, name: String, image: String, summonite_cost: u64) -> Result<()> {
        self.banner.set_inner(Banner {
            world: self.world.key(),
            name,
            image,
            summonite_cost,
            probability_total: 0,
            start_ts: 0,
            end_ts: i64::MAX,
            character_templates: vec![],
            index: self.world.banner_count,
        });
        self.world.banner_count += 1;
        Ok(())
    }
}

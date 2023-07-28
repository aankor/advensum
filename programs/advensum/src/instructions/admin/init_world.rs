use anchor_lang::prelude::*;

use crate::state::world::World;

#[derive(Accounts)]
pub struct InitWorld<'info> {
    #[account(zero)]
    pub world: Account<'info, World>,
}

impl<'info> InitWorld<'info> {
    pub fn process(&mut self, admin: Pubkey) -> Result<()> {
        self.world.set_inner(World {
            admin,
            stage_count: 0,
            stage_line_starts: vec![],
        });
        Ok(())
    }
}

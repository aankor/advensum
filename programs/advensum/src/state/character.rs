use anchor_lang::prelude::*;

#[account]
pub struct Character {
    pub stage_lines_progress: Vec<i32>,
}
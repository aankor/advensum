use anchor_lang::prelude::*;

#[account]
pub struct CharacterKind {
    pub rarity: i8,
    pub name: String,
}
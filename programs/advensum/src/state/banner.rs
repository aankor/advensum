use anchor_lang::prelude::*;

/*
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct BunnerBumps {
    pub address: u8,
}*/

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CharacterTemplate {
    pub probability: u32,
    pub min_hp: u32,
    pub max_hp: u32,
    pub min_attack: u32,
    pub max_attack: u32,
    pub name: String,
    pub uri: String,
}

#[account]
pub struct Banner {
    pub world: Pubkey,
    pub summonite_cost: u64,
    pub probability_total: u32,
    pub start_ts: i64,
    pub end_ts: i64,
    pub name: String,
    pub image: String,
    pub character_templates: Vec<CharacterTemplate>,
    pub index: u64,
}
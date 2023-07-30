pub mod world;
pub mod stage;
pub mod character;
pub mod banner;


use anchor_lang::prelude::*;

#[constant]
pub const ADDRESS_SEED: &'static [u8] = b"address";
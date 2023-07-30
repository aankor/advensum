# Adventures Summoner

It is a gatcha game fully based onchain. The client must know only programID and how to read accounts and call the program to be able to play the game (current client implementation is locked to a single game world with a hardcoded address but it is possible to add a world selector).

## Contract
Devnet deployment address: advsQ6WNSh5Fvsf1FxtLwFUV4ibxFa3GiF4Ko9zn5Ww
Contains accounts:
 
 1. ### World
 
 The root of the account tree. Contains global settings such as amin key, important mints, treasury, and prices for minting in-game currency. Same as a server in MMO games. Everyone may create their own World and become an admin without redeploying a contract by using CLI and running the init_world command. Admin will receive token payments in the currency selected on the world creation (by providing treasury with this mint). The current client is working in wSOL only
 
 2. ### Banner

The template for minting characters. Contains a list of characters you may mint with all required parameters and ranges for the stats. Additionally contains a name and image URL for displaying in the game. Can be created by admin using CLI and running init_banner and sequence of add_banner_item commands.

 3. ### Character

The character you own is an NFT token but this account is extending NFT mint by adding game-related data the same way as metaplex metadata is adding info on top of the token mint. It is a PDA dependent on the mint address only (so you can not use the same NFT in different worlds). Contains stats and the level of the character. Can be created by running mint_character from the game (clicking on the banner). Can be used as upgrade material for another character.

4. ### Not used accounts

## CLI
A typescript package for administration. Has commands:

 1. init-world
 2. init-banner
 3. add-banner-item
 4. set-character-collection (creates a collection NFT required to character minting)
 5. mint-character (for debugging)

## App

A vite/react/excalibut.js client prototype. It is rendering a game engine canvas and connects scenes to the react components for the game UI. React is used for wallet integration and blockchain data loading also synchronized with excalibur.js scenes

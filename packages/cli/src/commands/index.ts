import { Command } from "commander";
import { installInitWorld } from "./initWorld";
import { installInitBanner } from "./initBanner";
import { installSetCharactersCollection } from "./setCharactersCollection";
import { installAddBannerItem } from "./addBannerItem";
// import { installShow } from "./show";

export function installCommands(program: Command) {
    // installShow(program);
    installInitWorld(program);
    installInitBanner(program);
    installAddBannerItem(program);
    installSetCharactersCollection(program);
}

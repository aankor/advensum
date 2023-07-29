import { Command } from "commander";
import { installInitWorld } from "./initWorld";
// import { installShow } from "./show";

export function installCommands(program: Command) {
    // installShow(program);
    installInitWorld(program);
}

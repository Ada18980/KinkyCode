import { World } from "../world";
import { Actor } from "./actor";
import { CMDTypes } from "./cmdList";

export class CMD {
	public type: string;
	public args: string[];
	public time: number = 100;

	constructor(type: string, args: string[] = []) {
		this.type = type;
		this.args = args;
	}

}

export function CMDGetArg(cmd: CMD, argument: string): string {
	let type = CMDTypes[cmd.type];
	if (type?.args) {
		let index = type.args.findIndex(
			(arg) => {
				return arg[0] == argument;
			}
		);
		if (index >= 0) {
			if (cmd.args?.length >= 1+index) {
				return cmd.args[index];
			}
			return "";
		}
	}
	return undefined;
}

export function movementAlias(world: World, actor: Actor, str: string): string {
	switch (str.toLocaleUpperCase()) {
		case 'L': return ('-') + "," + ('=');
		case 'R': return ('+') + "," + ('=');
		case 'U': return ('=') + "," + ('-');
		case 'D': return ('=') + "," + ('+');
		case 'LEFT': return ('-') + "," + ('=');
		case 'RIGHT': return ('+') + "," + ('=');
		case 'UP': return ('=') + "," + ('-');
		case 'DOWN': return ('=') + "," + ('+');
		case 'UL': return ('-') + "," + ('-');
		case 'UR': return ('+') + "," + ('-');
		case 'DL': return ('-') + "," + ('+');
		case 'DR': return ('+') + "," + ('+');
		case 'LU': return ('-') + "," + ('-');
		case 'RU': return ('+') + "," + ('-');
		case 'LD': return ('-') + "," + ('+');
		case 'RD': return ('+') + "," + ('+');
		case 'CURRENT': return (actor.x) + "," + (actor.y);
		case 'ME': return (world.getPlayer().x) + "," + (world.getPlayer().y);
	}

	return str;
}

export function actorIntParse(actor: Actor, field: string, integer: string) {
	switch (integer) {
		case '=': return (actor as any)[field];
		case '-': return (actor as any)[field] - 1;
		case '+': return (actor as any)[field] + 1;
	}
	return parseInt(integer);
}
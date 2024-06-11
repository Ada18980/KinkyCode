import { MAX_VIEW_DIST } from "../../core/params";
import { GameActors } from "../map";
import { DistCheb } from "../maputil";
import { TileProperties } from "../tiletype";
import { World } from "../world";
import { actorTypes } from "./actorList";
import { CMD, CMDGetArg } from "./cmd";
import { CMDTypes } from "./cmdList";

export class Actor {
	id: number;
	type: string;
	x: number;
	y: number;
	awareness: number = 0;

	cmdQueue: CMD[];
	/** Cooldown is how long until the actor can take an action again */
	cooldown: number;

	constructor(id: number, type: string, x: number, y: number) {
		this.id = id;
		this.type = type;
		this.x = x;
		this.y = y;

		this.cmdQueue = [];
		this.cooldown = 10;
	}
}

/**
 * Helper class for actor stuff
 * Important because actors being serialized and deserialized removes the functions!!!
 */
export class Actors {


	public static canMove(actor: Actor, x: number, y: number, world: World) {
		return !TileProperties[world.getTile(x, y)]?.blockMovement && DistCheb(actor.x - x, actor.y - y) < 1.5 && (!world.getActor(x, y) || Actors.canSwap(actor, world.getActor(x, y)));
	}

	public static canSwap(actor: Actor, target: Actor) {
		return !actorTypes[actor.type]?.immobile && actorTypes[actor.type]?.rank > actorTypes[target.type]?.rank || !Actors.isHostile(actor, target);
	}
	public static isHostile(actor: Actor, target: Actor) {
		if (actor == target) return false;
		if (actorTypes[actor.type]?.player || actorTypes[target.type]?.player) {
			if (actorTypes[actor.type]?.neutral || actorTypes[target.type]?.neutral) return false;
			return true;
		}
		return false;
	}
	public static isAware(actor: Actor, target: Actor) {
		if (actor == target) return true;
		if (actorTypes[target.type]?.player) {
			if (actor.awareness < 1) return false;
			return true;
		}
		return DistCheb(actor.x-target.x, actor.y-target.y) <= Actors.getViewDist(actor);
	}



	public static addCMD(actor: Actor, cmd: CMD) {
		actor.cmdQueue.push(cmd);
	}

	public static executeNextCMD(actor: Actor, world: World) {
		let command = actor.cmdQueue.splice(0, 1)[0];
		let type = CMDTypes[command.type];
		if (type) {
			Actors.setCD(actor, type.execute(command, actor, world));
		}
	}

	public static removeSafeCMD(actor: Actor) {
		actor.cmdQueue =  actor.cmdQueue.filter(
			(cmd) => {
				return CMDGetArg(cmd, "SAFE");
			}
		);
	}
	public static removeCMDByTag(actor: Actor, tag: string) {
		actor.cmdQueue =  actor.cmdQueue.filter(
			(cmd) => {
				let type = CMDTypes[cmd.type];
				if (type) {
					return !(type.cancelTags?.includes(tag));
				}
				return true;
			}
		);
	}
	public static removeCMDByNoTag(actor: Actor, tag: string) {
		actor.cmdQueue =  actor.cmdQueue.filter(
			(cmd) => {
				let type = CMDTypes[cmd.type];
				if (type) {
					return (type.cancelTags?.includes(tag));
				}
				return false;
			}
		);
	}

	public static setCD(actor: Actor, cooldown: number) {
		actor.cooldown = Math.max(actor.cooldown || 0, cooldown);
	}

	public static getViewDist(actor: Actor) {
		let type = actorTypes[actor.type];
		return type.viewDist || MAX_VIEW_DIST;
	}
	public static getSpeed(actor: Actor) {
		let type = actorTypes[actor.type];
		return type.speed || 100;
	}

	public static addActor(actor: Actor, actors: GameActors) {
		actors.list.push(actor);
		actors.stale = true;
	}
}
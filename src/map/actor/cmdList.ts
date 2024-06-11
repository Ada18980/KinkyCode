
import { DistCheb } from "../maputil";
import { World } from "../world";
import { Actor, Actors } from "./actor";
import { CMD, actorIntParse } from "./cmd";

export interface CMDType {
	/** negative time = variable */
	time: number,
	args?: [string, string][],
	execute: (cmd: CMD, actor: Actor, world: World) => number,
	cancelTags?: string[],
	difficulty: (cmd: CMD, actor: Actor, world: World) => number,
}

export let CMDTypes: Record<string, CMDType> = {
	WALK: {
		time: -1,
		args: [
			["X", "Num"],
			["Y", "Num"],
			["SAFE", "Bool"],
		],
		cancelTags: [
			"minor",
		],
		difficulty: () => {return 1;},
		execute: (cmd: CMD, actor: Actor, world: World) => {
			try {
				let x = actorIntParse(actor, 'x', cmd.args[0]);
				let y = actorIntParse(actor, 'y', cmd.args[1]);

				if (DistCheb(actor.x-x, actor.y-y) > 1.5) {
					let path = world.findPath(actor.x, actor.y, x, y, actor,
						true, false, false);
					if (path) {
						x = path[0].x;
						y = path[0].y;
					}
				}

				if (Actors.canMove(actor, x, y, world)) {
					let speed = Actors.getSpeed(actor);
					world.moveActor(actor.id, x, y);
					return speed;
				} else if (actor == world.getPlayer()) {
					Actors.removeCMDByTag(actor, "minor");
				}
			} catch (err) {
				console.log(err);
			}

			return 0;
		}
	},
	WAIT: {
		time: -1,
		args: [
			["TIME", "Num"],
			["SAFE", "Bool"],
		],
		cancelTags: [
			"minor",
		],
		difficulty: (cmd: CMD, actor: Actor, world: World) => {
			let time = 0;
			if (cmd.args.length > 0) {
				try {
					time = parseInt(cmd.args[0]);
				} catch (err) {
					console.log(err);
				}
			}
			if (!time) time = 50;
			return 0.5 * Math.floor(time / 50);
		},
		execute: (cmd: CMD, actor: Actor, world: World) => {
			let time = 0;
			if (cmd.args.length > 0) {
				try {
					time = parseInt(cmd.args[0]);
				} catch (err) {
					console.log(err);
				}
			}
			let safe = cmd.args.length > 1;
			if (!time) time = 50;
			if (time > 50) {
				actor.cmdQueue.unshift(new CMD(
					cmd.type,
					safe ? [(time-50) + "", "true"] : [(time-50) + ""]
				))
			}
			return Math.min(time, 50);
		}
	},
}
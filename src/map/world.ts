
/**
 * World class, stores the game world
 *
 * Compare to: State, a class for storing information and running different states of the game
 * Compare to: GameScreen, a class for storing and drawing UI
 * Compare to: InputHandler, a class which receives inputs and passes them along to the game world in the order which they were received
 */

import { Actor, Actors } from "./actor/actor";
import { actorTypes } from "./actor/actorList";
import { GameActors, GameMap } from "./map";
import { generate_actors, generate_map } from "./gen/mapgen";
import { DistCheb, MapPoint, pathfind } from "./maputil";
import { TileProperties, TileType } from "./tiletype";
import { Viewport, Vision } from "./view/vision";
import { KDRandom } from "../core/random";


export interface SaveDataObject {
	map: GameMap,
	actors: GameActors,
	callSigns: Record<number, string>;
	callSignsID: Record<string, number>;
}

export class World {
	public map: GameMap;
	public actors: GameActors;
	public level: number = 0;

	public playerActor: Actor = null;
	public actorCache: Map<string, Actor> = new Map();
	public idCache: Map<number, Actor> = new Map();

	public actorID: number = 1;

	public vision: Vision;

	public constructor(saveData: string = "") {
		this.vision = new Vision();
		if (saveData) {
			try {
				let saveObject: SaveDataObject = JSON.parse(saveData);
				if (saveObject.map) this.map = saveObject.map;
				if (saveObject.actors) this.actors = saveObject.actors;
				if (saveObject.callSigns) this.callSigns = saveObject.callSigns;
				if (saveObject.callSignsID) this.callSignsID = saveObject.callSignsID;
			} catch (err) {
				console.log(err);
			}
		}

		if (!this.getPlayer()) {
			// Create player
			this.playerActor = new Actor(-1, "Player", 0, 0);
		}
		if (!this.map || !this.actors) this.genMap();

		this.actors.stale = true;
		this.vision.clearVision();
	}

	public callSigns: Record<number, string> = {};
	public callSignsID: Record<string, number> = {};

	public getCallsign(actor: Actor): string {
		if (this.callSigns[actor.id]) {
			return this.callSigns[actor.id];
		}
		return this.generateCallsign(actor);
	}
	public generateCallsign(actor: Actor): string {
		let type = actorTypes[actor.type];
		if (type) {
			if (type.player) return "00";
			for (let i = 0; i < 10000; i++) {
				let pre = String.fromCharCode(97 + Math.floor(26 * KDRandom()));
				let post = Math.floor(10 * KDRandom());
				if (!this.callSignsID[pre+post]) {
					this.callSignsID[pre+post] = actor.id;
					this.callSigns[actor.id] = pre+post;
					return pre+post;
				}
			}
			return "OL";
		}
		return "ER";
	}

	public getID(): number {
		return this.actorID++;
	}

	public genMap(type: string = "Default", security: string = "Low") {
		this.map = new GameMap(1, 1);
		this.actors = new GameActors([]);
		this.map = generate_map(type, this);
		this.actors = generate_actors(security, this);
		// Place the player
		let player = this.getPlayer();
		if (player) {
			player.x = this.map.startPosX;
			player.y = this.map.startPosY;
		}
	}



	public getPlayer() {
		if (this.playerActor) return this.playerActor;

		if (this.actors)
			for (let act of this.actors.list) {
				if (actorTypes[act.type]?.player) {
					this.playerActor = act;
					break;
				};
			}
		return this.playerActor;
	}

	public updateLighting() {
		if (this.vision.visionStale()) return; // Skip if already done

		let viewports: Viewport[] = [];
		let player = this.getPlayer();
		viewports.push(new Viewport(
			player.x, player.y, Actors.getViewDist(player)
		));

		this.vision.updateVision(this, viewports);
	}

	public findPath(x1: number, y1: number, x2: number, y2: number, actor: Actor, blockActor: boolean = false, noDoors: boolean = false, requireVision: boolean = false): MapPoint[] {
		return pathfind(this.map, x1, y1, x2, y2, this, {
			blockActor: blockActor,
			noDoors: noDoors,
			requireLight: requireVision,
			trimLongDistance: false,
			actor: actor,
		});
	}

	public CanSeeTile(actor: Actor, x: number, y: number) {
		let viewdist = Actors.getViewDist(actor);
		return DistCheb(actor.x - x, actor.y - y) < viewdist && this.checkVision(actor.x, actor.y, x, y, 2);
	}

	public checkVision(x1: number, y1: number, x2: number, y2: number, maxFails: number = 1) {
		return this.checkVisionCount(x1, y1, x2, y2, maxFails) < maxFails;
	}
	public checkVisionCount(x1: number, y1: number, x2: number, y2: number, maxFails?: number) {
		if (x1 == x2 && y1 == y2) return 0;
		let length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
		let maxFailsAllowed = maxFails ? maxFails : 1;
		let fails = 0;

		for (let F = 0; F <= length; F++) {
			let xx = x1 + (x2-x1)*F/length;
			let yy = y1 + (y2-y1)*F/length;

			if ((Math.round(xx) != x1 || Math.round(yy) != y1) && (Math.round(xx) != x2 || Math.round(yy) != y2)) {
				let hits = 0;
				if ((TileProperties[this.getTile(Math.floor(xx), Math.floor(yy))]?.blockVision)) hits += 1;
				if ((TileProperties[this.getTile(Math.round(xx), Math.round(yy))]?.blockVision)) hits += 1;
				if (hits < 2 && (TileProperties[this.getTile(Math.ceil(xx), Math.ceil(yy))]?.blockVision)) hits += 1;


				if (hits >= 2) {
					fails += 1;
					if (fails >= maxFailsAllowed)
						return fails;
				}
			}
		}

		return fails;
	}


	public getTile(x: number, y: number, map: GameMap = this.map) : TileType {
		if (x >= 0 && y >= 0 && x < map.mapWidth && y < map.mapHeight) {
			return map.mapGrid[y][x];
		}
		return TileType.Invalid;
	}

	public setTile(x: number, y: number, tile: TileType, map: GameMap = this.map) {
		if (x >= 0 && y >= 0 && x < map.mapWidth && y < map.mapHeight) {
			map.mapGrid[y][x] = tile;
		}
	}

	public getFog(x: number, y: number, map: GameMap = this.map) : number {
		if (x >= 0 && y >= 0 && x < map.mapWidth && y < map.mapHeight) {
			return map.fogGrid[y][x];
		}
		return 0;
	}

	public setFog(x: number, y: number, fog: number, map: GameMap = this.map) {
		if (x >= 0 && y >= 0 && x < map.mapWidth && y < map.mapHeight) {
			map.fogGrid[y][x] = fog;
		}
	}

	public getActor(x: number, y: number) : Actor {
		this.updateActorCache();
		return this.actorCache.get(x + ',' + y);
	}
	public getActorID(id: number) : Actor {
		this.updateActorCache();
		return this.idCache.get(id);
	}
	public moveActor(id: number, x: number, y: number) {
		let actor = this.getActorID(id);
		if (actor) {
			let existingActor = this.getActor(x, y);
			this.actors.stale = true;
			// Swap
			if (existingActor) {
				existingActor.x = actor.x;
				existingActor.y = actor.y;
			}
			actor.x = x;
			actor.y = y;
		}
	}




	/** Updates in TIME UNITS */
	public tick(danger: boolean = false, breakOnPlayerReady: boolean = true): boolean {
		this.vision.clearVision();

		let actorsWithCMD: Actor[] = [];

		actorsWithCMD = this.actors.list.filter(
			(actor) => {
				return actor.cmdQueue.length > 0 && !actor.cooldown;
			}
		);

		let max = 1000000;
		let iter = 0;
		while (actorsWithCMD.length > 0 && iter < max) {
			iter++;
			actorsWithCMD.sort((a, b) => {
				return Actors.getSpeed(b) - Actors.getSpeed(a);
			});
			for (let actor of actorsWithCMD) {
				Actors.executeNextCMD(actor, this);
				if (actor == this.getPlayer() && danger) {
					Actors.removeSafeCMD(actor);
				}
			}

			if (breakOnPlayerReady && this.getPlayer().cooldown == 0) {
				return true;
			}

			actorsWithCMD = this.actors.list.filter(
				(actor) => {
					return actor.cmdQueue.length > 0 && !actor.cooldown;
				}
			);
		}

		this.actors.list.forEach(
			(actor) => {
				if (actor.cooldown > 0) actor.cooldown -= 1;
			}
		);
		return false;
	}

	public updateActorCache(force?: boolean) {
		if (force || this.actors.stale) {
			this.actorCache = new Map();
			this.idCache = new Map();
			this.actors.stale = false;
			for (let act of this.actors.list) {
				if (!this.actorCache.get(act.x + ',' + act.y)) {
					this.actorCache.set(act.x + ',' + act.y, act);
				}
				if (!this.idCache.get(act.id)) {
					this.idCache.set(act.id, act);
				}
			}
		}
	}

	public getSaveData() : string {
		this.playerActor = undefined;
		this.actorCache = undefined;
		this.idCache = undefined;
		this.vision = undefined;
		let str = JSON.stringify(this);
		this.actorCache = new Map();
		this.idCache = new Map();
		this.playerActor = this.getPlayer();
		this.vision = new Vision();
		return str;
	}

}
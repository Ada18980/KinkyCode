import { PATHFIND_TRIM_DIST } from "../core/params";
import { KDRandom } from "../core/random";
import { Actor, Actors } from "./actor/actor";
import { GameMap } from "./map";
import { TileProperties, TileType } from "./tiletype";
import { World } from "./world";

export interface MapPoint {
	x: number,
	y: number,
	g?: number,
	s?: string,
	dirX?: number,
	dirY?: number,
}

export function DistCheb(x: number, y: number): number {
	return Math.max(Math.abs(x), Math.abs(y));
}
export function DistTaxi(x: number, y: number): number {
	return Math.abs(x) + Math.abs(y);
}

/** Pathfinding function */
export function pathfind(map: GameMap, x1: number, y1: number, x2: number, y2: number, world: World, options?: {
	blockActor: boolean,
	noDoors: boolean,
	requireLight: boolean,
	trimLongDistance?: boolean,
	actor: Actor,

}): MapPoint[] {
	// Simple condition
	if (DistCheb(x1 - x2, y1 - y2) < 1.5) {
		return [{x: x2, y: y2}];
	}

	// Heuristic function for A* algo
	function heuristic(xx: number, yy: number, x2x: number, y2y: number) {
		return ((xx - x2x) * (xx - x2x) + (yy - y2y) * (yy - y2y)) ** 0.5;
	}
	let heur = heuristic;

	// g = cost
	// f = cost with heuristic
	// s = source
	let start = {x: x1, y: y1, g: 0, f: 0, s: ""};

	// We generate a grid based on map size
	let open = new Map();
	open.set(x1 + "," + y1, start);
	let closed = new Map();

	let costBonus = 0;
	//let MapTile = null;
	let moveCost = 1;
	let succ = new Map();

	while(open.size > 0) {
		// Trim if it takes too long
		if (options?.trimLongDistance && (closed.size > PATHFIND_TRIM_DIST || open.size > 3*PATHFIND_TRIM_DIST)) {
			console.log("Quit pathfinding");
			return undefined; // Give up
		}
		let lowest: MapPoint = null;
		let lc = 1000000000;
		// Get the open tile with the lowest weight
		open.forEach(o => {
			if (o.f < lc) {
				lc = o.f;
				lowest = o;
			}
		});
		if (lowest) {
			let lowLoc = lowest.x + "," + lowest.y;
			moveCost = 1;
			succ = new Map();
			// Check bordering tiles on the lowest
			for (let x = -1; x <= 1; x++) {
				for (let y = -1; y <= 1; y++) {
					if ((x != 0 || y != 0)) { //  && (!taxicab || y == 0 || x == 0)
						let xx = lowest.x + x;
						let yy = lowest.y + y;
						let tile = (xx == x2 && yy == y2) ? TileType.Invalid : mapGetTile(map, xx, yy);
						//MapTile = KinkyDungeonTilesGet((xx) + "," + (yy));
						//let locIndex = `${lowLoc},${x2},${y2}`;
						// If we have found the end
						if (xx == x2 && yy == y2) {
							closed.set(lowLoc, lowest);
							let newPath = KinkyDungeonGetPath(closed, lowest.x, lowest.y, x2, y2);

							if (newPath.length > 0 && !TileProperties[mapGetTile(map, newPath[0].x, newPath[0].y)]?.blockMovement)
								return newPath;
							else return null;
						}
						// Give up and add to the test array
						else if (!TileProperties[tile]?.blockMovement
							&& (!options.requireLight
								|| world.vision.getVision(xx, yy) > 0
								|| (world.getFog(xx, yy) != TileType.Invalid)
							)
							//&& (ignoreLocks || !MapTile || !MapTile.Lock || (Enemy && KDLocks[MapTile.Lock].canNPCPass(xx, yy, MapTile, Enemy)))
							&& (!options.blockActor || !world.getActor(xx, yy) || (
								options.actor
								&& (options.actor == world.getActor(xx, yy)
								|| Actors.canSwap(options.actor, world.getActor(xx, yy)))
							)
							)
							//&& (!blockPlayer || KinkyDungeonPlayerEntity.x != xx || KinkyDungeonPlayerEntity.y != yy)
							//&& (!needDoorMemory || tile != "d" || KDOpenDoorTiles.includes(KDMapData.TilesMemory[xx + "," + yy])))
							) {
							costBonus = 0;
							succ.set(xx + "," + yy, {x: xx, y: yy,
								g: moveCost + costBonus + lowest.g,
								f: moveCost + costBonus + lowest.g + heur(xx, yy, x2, y2),
								s: lowLoc});
						}
					}
				}
			}
			succ.forEach(s => {
				let q = s.x + "," + s.y;
				let openSucc = open.get(q);
				if (!openSucc || openSucc.f > s.f) {
					let closedSucc = closed.get(q);
					if (!closedSucc || closedSucc.f > s.f) {
						open.set(q, s);
					}
				}
			});


			open.delete(lowLoc);

			closed.set(lowLoc, lowest);
		} else {
			open.clear();
			console.log("Pathfinding error! Please report this!");
		}
	}

	return null;
}



// Goes back and gets path backwards from xx, adding endx and endy
function KinkyDungeonGetPath(closed: Map<string, MapPoint>, xx: number, yy: number, endx: number, endy: number) {
	let list = [];
	if (endx && endy) list.push({x: endx, y: endy});

	let current = closed.get(xx + "," + yy);
	while (current) {
		if (current.s) {
			list.push({x: current.x, y: current.y});
			current = closed.get(current.s);
		} else current = undefined;
	}

	return list.reverse();
}


export function mapAddRoom(map: GameMap, tiles: MapPoint[]) {
	for (let tile of tiles) {
		map.mapRooms[tile.x + ',' + tile.y] = map.mapRoomCount;
	}
	map.mapRoomDef[map.mapRoomCount] = tiles;
	map.mapRoomCount += 1;
}

export function mapGetRoom(map: GameMap, x: number, y: number) : number {
	if (x >= 0 && y >= 0 && x < map.mapWidth && y < map.mapHeight && map.mapRooms[x + ',' + y] != undefined) {
		return map.mapRooms[x + ',' + y];
	}
	return -1;
}

export function mapGetTile(map: GameMap, x: number, y: number) : TileType {
	if (x >= 0 && y >= 0 && x < map.mapWidth && y < map.mapHeight) {
		return map.mapGrid[y][x];
	}
	return TileType.Invalid;
}

export function mapSetTile(map: GameMap, x: number, y: number, tile: TileType) {
	if (x >= 0 && y >= 0 && x < map.mapWidth && y < map.mapHeight) {
		map.mapGrid[y][x] = tile;
	}
}

export function randPoint(list: any[]): any {
	if (list.length > 0) {
		return list[Math.floor(KDRandom()*list.length)];
	}
	return null;
}
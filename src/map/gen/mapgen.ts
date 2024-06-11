import { ActorGenTypes } from "../actor/actorgentypes";
import { GameActors, GameMap } from "../map";
import { MapGenTypes } from "./mapgentypes";
import { World } from "../world";
import { DistTaxi, MapPoint, mapGetTile, mapSetTile } from "../maputil";
import { KDRandom } from "../../core/random";
import { TileType } from "../tiletype";

export interface MapGen {
	minWidth: number,
	maxWidth: number,
	minHeight: number,
	maxHeight: number,
	roomSize: number,
	genFunc: (type: MapGen, world: World) => GameMap;
};
export interface ActorGen {
	genFunc: (type: ActorGen, world: World) => GameActors;
};


export function generate_map(mapType: string, world: World): GameMap {
	if (!MapGenTypes[mapType]) mapType = "Default";

	let mapGenType = MapGenTypes[mapType]
	for (let i = 0; i < 1000; i++) {
		let map = mapGenType.genFunc(mapGenType, world);
		if (map) return map;
	}

	return new GameMap(1, 1);
}
export function generate_actors(securityType: string, world: World): GameActors {
	if (!MapGenTypes[securityType]) securityType = "Low";

	let actorGenType = ActorGenTypes[securityType]
	for (let i = 0; i < 1000; i++) {
		let map = actorGenType.genFunc(actorGenType, world);
		if (map) return map;
	}

	return new GameActors([world.getPlayer()]);
}

export function findBorderPoint(map: GameMap): MapPoint {
	// Find a list of all eligible door points, i.e places with exactly 6 empty tiles on one side
	let bordering: MapPoint[] = [];

	for (let y = 0; y < map.mapHeight; y++) {
		for (let x = 0; x < map.mapWidth; x++) {
			if (mapGetTile(map, x, y) == TileType.Wall) {
				let crossFloors: MapPoint[] = [];
				let cornerFloors: MapPoint[] = [];
				for (let xx = -1; xx <= 1; xx++) {
					for (let yy = -1; yy <= 1; yy++) {
						if ((xx != 0 || yy != 0) && mapGetTile(map, xx+x, yy+y) == TileType.Floor) {
							if (xx == 0 || yy == 0) {
								crossFloors.push({x: xx+x, y: yy+y});
							} else {
								cornerFloors.push({x: xx+x, y: yy+y});
							}
						}
					}
				}
				if (crossFloors.length == 1) {
					if (cornerFloors.length == 2) {
						if (cornerFloors.every(
							(point) => {
								return DistTaxi(point.x - crossFloors[0].x, point.y - crossFloors[0].y) == 1;
							}
						)) {
							bordering.push({x: x, y: y, dirX: crossFloors[0].x - x, dirY: crossFloors[0].y - y});
						}
					}
				}
			}
		}
	}

	if (bordering.length > 0) {
		return bordering[Math.floor(KDRandom() * bordering.length)];
	}
	return null;
}

export function findThinPoint(map: GameMap): MapPoint {
	// Find a list of all eligible door points, i.e places with exactly 6 empty tiles on one side
	let bordering: MapPoint[] = [];

	for (let y = 0; y < map.mapHeight; y++) {
		for (let x = 0; x < map.mapWidth; x++) {
			if (mapGetTile(map, x, y) == TileType.Wall) {
				let crossFloors: MapPoint[] = [];
				let cornerFloors: MapPoint[] = [];
				for (let xx = -1; xx <= 1; xx++) {
					for (let yy = -1; yy <= 1; yy++) {
						if ((xx != 0 || yy != 0) && mapGetTile(map, xx+x, yy+y) == TileType.Floor) {
							if (xx == 0 || yy == 0) {
								crossFloors.push({x: xx+x, y: yy+y});
							} else {
								cornerFloors.push({x: xx+x, y: yy+y});
							}
						}
					}
				}
				if (crossFloors.length == 2) {
					if (cornerFloors.length == 4) {
						if (crossFloors[0].x == crossFloors[1].x || crossFloors[0].y == crossFloors[1].y) {
							bordering.push({x: x, y: y, dirX: crossFloors[0].x - x, dirY: crossFloors[0].y - y});
						}
					}
				}
			}
		}
	}

	if (bordering.length > 0) {
		return bordering[Math.floor(KDRandom() * bordering.length)];
	}
	return null;
}

export function checkRoom(map: GameMap, tiletype: TileType, RoomLeft: number, RoomTop: number, RoomWidth: number, RoomHeight: number): boolean {
	for (let x = RoomLeft; x < RoomLeft + RoomWidth; x++) {
		for (let y = RoomTop; y < RoomTop + RoomHeight; y++) {
			if (mapGetTile(map, x, y) != tiletype) return false;
		}
	}
	return true;
}
export function setRoom(map: GameMap, tiletype: TileType, RoomLeft: number, RoomTop: number, RoomWidth: number, RoomHeight: number) {
	let tiles: MapPoint[] = [];
	for (let x = RoomLeft; x < RoomLeft + RoomWidth; x++) {
		for (let y = RoomTop; y < RoomTop + RoomHeight; y++) {
			mapSetTile(map, x, y, tiletype);
			tiles.push({x: x, y: y});
		}
	}
	return tiles;
}
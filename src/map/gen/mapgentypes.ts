import { KDRandom } from "../../core/random";
import { GameMap } from "../map";
import { MapGen, checkRoom, findBorderPoint, findThinPoint, setRoom } from "./mapgen";
import { TileType } from "../tiletype";
import { mapAddRoom, mapSetTile } from "../maputil";

export let MapGenTypes: Record<string, MapGen> = {
	Default: {
		minWidth: 50,
		maxWidth: 70,
		minHeight: 50,
		maxHeight: 70,
		roomSize: 10,
		genFunc: (type, world) => {
			let width = type.minWidth + Math.floor(KDRandom() * (type.maxWidth - type.minWidth));
			let height = type.minHeight + Math.floor(KDRandom() * (type.maxHeight - type.minHeight));
			let map = new GameMap(width, height);

			// Create a main vertical spoke and a horizontal spoke that intersect
			let s1_a = Math.floor(width*(0.1 + 0.3*KDRandom())) ;
			let s1_b = Math.floor(width*(0.9 - 0.3*KDRandom())) ;
			let s2_a = Math.floor(height*(0.1 + 0.3*KDRandom())) ;
			let s2_b = Math.floor(height*(0.9 - 0.3*KDRandom())) ;

			for (let x = s1_a; x <= s1_b; x++) {
				world.setTile(x, Math.floor(height/2), TileType.Floor, map);
				world.setTile(x, Math.floor(height/2) - 1, TileType.Floor, map);
				world.setTile(x, Math.floor(height/2) + 1, TileType.Floor, map);
			}
			for (let y = s2_a; y <= s2_b; y++) {
				world.setTile(Math.floor(width/2), y, TileType.Floor, map);
				world.setTile(Math.floor(width/2) - 1, y, TileType.Floor, map);
				world.setTile(Math.floor(width/2) + 1, y, TileType.Floor, map);
			}

			let tryToFindDoor = true;
			let max = 100;
			let iter = 0;
			let room = 0;
			while (tryToFindDoor && iter < max) {
				iter++;
				let point = findBorderPoint(map);
				if (point) {

					let RoomLeft = point.x - point.dirX;
					let RoomTop = point.y - point.dirY;
					let RoomWidth = 1;
					let RoomHeight = 1;
					// Grow the room
					for (let i = 0; i < type.roomSize; i++) {
						if (KDRandom() < 0.5 && checkRoom(map, TileType.Wall, RoomLeft - 1 - 1, RoomTop - 1, RoomWidth + 1 + 2, RoomHeight + 2)) {
							RoomLeft -= 1;
							RoomWidth += 1;
						}
						if (KDRandom() < 0.5 && checkRoom(map, TileType.Wall, RoomLeft - 1, RoomTop - 1, RoomWidth + 1 + 2, RoomHeight + 2)) {
							RoomWidth += 1;
						}
						if (KDRandom() < 0.5 && checkRoom(map, TileType.Wall, RoomLeft - 1, RoomTop - 1 - 1, RoomWidth + 2, RoomHeight + 1 + 2)) {
							RoomTop -= 1;
							RoomHeight += 1;
						}
						if (KDRandom() < 0.5 && checkRoom(map, TileType.Wall, RoomLeft - 1, RoomTop - 1, RoomWidth + 2, RoomHeight + 1 + 2)) {
							RoomHeight += 1;
						}
					}

					if (RoomWidth > 1 && RoomHeight > 1) {
						mapSetTile(map, point.x, point.y, TileType.Floor);
						mapAddRoom(map, setRoom(map, TileType.Floor, RoomLeft, RoomTop, RoomWidth, RoomHeight));
						room++;
					} else {
						//mapSetTile(map, point.x, point.y, TileType.Wall);
					}
				} else {
					tryToFindDoor = false;
				}
			}

			iter = 0;
			// Limited shortcuts per room
			while (iter < room * 0.25) {
				iter++;
				let point = findThinPoint(map);
				if (point) {
					mapSetTile(map, point.x, point.y, TileType.Floor);
				}
			}

			// Start player at one of 4 corners

			switch (Math.floor(KDRandom() * 4)) {
				case 1: {
					map.startPosX = s1_a;
					map.startPosY = Math.floor(height/2);
					break;
				}
				case 2: {
					map.startPosX = s1_b;
					map.startPosY = Math.floor(height/2);
					break;
				}
				case 3: {
					map.startPosY = s2_a;
					map.startPosX = Math.floor(width/2);
					break;
				}
				case 0:
				default: {
					map.startPosY = s2_b;
					map.startPosX = Math.floor(width/2);
					break;
				}
			}

			return map;
		}
	}
};

import { Actor } from "./actor/actor";
import { MapPoint } from "./maputil";
import { TileType } from "./tiletype";

export class GameMap {
	public mapGrid: TileType[][] = [];
	public fogGrid: TileType[][] = [];
	public mapWidth = 1;
	public mapHeight = 1;
	public startPosX = 0;
	public startPosY = 0;

	public mapRoomCount = 0;
	public mapRooms: Record<string, number> = {};
	public mapRoomDef: Record<number, MapPoint[]> = {};


	constructor(width: number, height: number) {
		this.mapWidth = width;
		this.mapHeight = height;

		// Generate wall
		this.mapGrid = [];
		this.fogGrid = [];
		for (let y = 0; y < this.mapHeight; y++) {
			let row : TileType[] = [];
			let frow : TileType[] = [];
			for (let x = 0; x < this.mapWidth; x++) {
				row.push((y == 0 || x == 0 || y == this.mapHeight-1 || x == this.mapWidth-1) ? TileType.EdgeWall : TileType.Wall);
				frow.push(TileType.Invalid);
			}
			this.mapGrid.push(row);
			this.fogGrid.push(frow);
		}
	}


}
export class GameActors {
	public list: Actor[];
	public stale: boolean = false;

	constructor(addActors: Actor[]) {
		this.list = [];
		for (let act of addActors) {
			if (act)
				this.list.push(act);
		}
	}


}



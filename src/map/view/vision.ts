import { GameBoard } from "../../states/game/gameboard";
import { GameMap } from "../map";
import { TileProperties } from "../tiletype";
import { World } from "../world";

export class Viewport {
	x: number;
	y: number;
	dist: number;

	constructor(x: number, y: number, dist: number) {
		this.x = x;
		this.y = y;
		this.dist = dist;
	}
}

export class Vision {

	private visionGrid: number[][] = null;
	private visionFloorGrid: number[][] = null;
	private currentMap: GameMap = null;

	constructor() {
	}

	public clearVision() {
		this.visionGrid = null;
		this.visionFloorGrid = null;
	}

	public visionStale() {
		return this.visionGrid != null;
	}

	public updateVision(world: World, viewports: Viewport[]) {
		if (this.visionStale()) return; // Skip if already done
		this.visionGrid = [];
		this.visionFloorGrid = [];
		let map = world.map;
		this.currentMap = map;
		for (let y = 0; y < map.mapHeight; y++) {
			let row : number[] = [];
			let row2 : number[] = [];
			for (let x = 0; x < map.mapWidth; x++) {
				row.push(0);
				row2.push(0);
			}
			this.visionGrid.push(row);
			this.visionFloorGrid.push(row2);
		}

		for (let viewport of viewports) {
			let ox = viewport.x;
			let oy = viewport.y;
			for (let i = 0; i < viewport.dist; i++) {
				for (let xx = ox - i; xx <= ox + i; xx++) {
					for (let yy = oy - i; yy <= oy + i; yy++) {
						if (Math.abs(xx - ox) == i || Math.abs(yy - oy) == i)
							if (i == 0 || world.checkVision(ox, oy, xx, yy)) {
								this.setVision(xx, yy, this.getVision(xx, yy) + 1);
								if (!TileProperties[world.getTile(xx, yy)]?.blockVision) {
									this.setFloorVision(xx, yy, this.getFloorVision(xx, yy) + 1);
									world.setFog(xx, yy, world.getTile(xx, yy));
								}
							}
					}
				}
			}

			for (let i = 0; i < viewport.dist; i++) {
				for (let xx = ox - i; xx <= ox + i; xx++) {
					for (let yy = oy - i; yy <= oy + i; yy++) {
						if (Math.abs(xx - ox) == i || Math.abs(yy - oy) == i)
							if (i > 1 &&  world.checkVision(ox, oy, xx, yy, 3)) {
								let success = this.getFloorVision(xx - 1, yy) > 0
								|| this.getFloorVision(xx + 1, yy) > 0
								|| this.getFloorVision(xx, yy - 1) > 0
								|| this.getFloorVision(xx, yy + 1) > 0
								|| this.getFloorVision(xx - 1, yy + 1) > 0
								|| this.getFloorVision(xx + 1, yy - 1) > 0
								|| this.getFloorVision(xx - 1, yy - 1) > 0
								|| this.getFloorVision(xx + 1, yy + 1) > 0
								if (success) {
									this.setVision(xx, yy, this.getVision(xx, yy) + 1);
									world.setFog(xx, yy, world.getTile(xx, yy));
								}
							}
					}
				}
			}
		}
	}

	public setVision(x: number, y: number, vision: number) {
		if (this.currentMap) {
			if (x >= 0 && y >= 0 && x < this.currentMap.mapWidth && y < this.currentMap.mapHeight) {
				this.visionGrid[y][x] = vision;
			}
		}
	}
	public getVision(x: number, y: number) : number {
		if (this.currentMap) {
			if (x >= 0 && y >= 0 && x < this.currentMap.mapWidth && y < this.currentMap.mapHeight) {
				return this.visionGrid[y][x];
			}
		}
		return 0;
	}

	public setFloorVision(x: number, y: number, vision: number) {
		if (this.currentMap) {
			if (x >= 0 && y >= 0 && x < this.currentMap.mapWidth && y < this.currentMap.mapHeight) {
				this.visionFloorGrid[y][x] = vision;
			}
		}
	}
	public getFloorVision(x: number, y: number) : number {
		if (this.currentMap) {
			if (x >= 0 && y >= 0 && x < this.currentMap.mapWidth && y < this.currentMap.mapHeight) {
				return this.visionFloorGrid[y][x];
			}
		}
		return 0;
	}
}
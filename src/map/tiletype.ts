export enum TileType {
	Floor,
	Wall,
	EdgeWall,
	Exit,
	Invalid,
}

export interface TileProperties {
	sprite: (skin: string) => string,
	destructible: boolean,
	blockVision: boolean,
	blockProjectiles: boolean,
	blockMovement: boolean,
	destroyTo?: TileType,
}

export let TileProperties: Record<TileType, TileProperties> = {
	[TileType.Floor]: {
		blockMovement: false,
		blockProjectiles: false,
		blockVision: false,
		destructible: false,
		sprite: (skin: string) => `tiles/${skin}/Floor.png`,
	},
	[TileType.EdgeWall]: {
		blockMovement: true,
		blockProjectiles: true,
		blockVision: true,
		destructible: false,
		sprite: (skin: string) => `tiles/${skin}/Wall.png`,
	},
	[TileType.Wall]: {
		blockMovement: true,
		blockProjectiles: true,
		blockVision: true,
		destructible: false,
		destroyTo: TileType.Floor,
		sprite: (skin: string) => `tiles/${skin}/Wall.png`,
	},
	[TileType.Exit]: {
		blockMovement: false,
		blockProjectiles: false,
		blockVision: false,
		destructible: false,
		sprite: (skin: string) => `tiles/${skin}/WallVert.png`,
	},
	[TileType.Invalid]: {
		blockMovement: false,
		blockProjectiles: false,
		blockVision: false,
		destructible: false,
		sprite: (skin: string) => `tiles/${skin}/WallVert.png`,
	},
}
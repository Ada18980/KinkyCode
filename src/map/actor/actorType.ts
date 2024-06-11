export interface ActorType {
	name: string,
	/**
	 * SPECIAL only player should have this
	 */
	player?: boolean,
	/**
	 * Enemy is neutral and you can swap
	 */
	neutral?: boolean,
	/**
	 * Cooldown of a move action, less is better
	 */
	speed: number,
	sprite: () => string,
	viewDist?: number,
	immobile?: boolean,
	rank: number,
	security: number,
}
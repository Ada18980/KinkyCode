
import { DrawText, getGlitchColor } from "../../core/draw";
import { Engine } from "../../core/engine";
import { GLITCH_TILE, TEXTCOLOR } from "../../core/params";
import { GameBoard } from "../../states/game/gameboard";
import { Actor } from "../actor/actor";
import { actorTypes } from "../actor/actorList";
import { TileProperties, TileType } from "../tiletype";
import { World } from "../world";


export function renderMap(screen: GameBoard, world: World, offsetx: number, offsety: number, x: number, y: number, width: number, height: number, gridSize: number = 16, showCallsign: boolean = false, showGrid: boolean = false) {
	//let map = world.map;
	let tile = TileType.Invalid;
	let actor: Actor = null;
	let skin = "Default"; // TODO

	let newVis: Record<string, number> = {};
	let newVisFog: Record<string, number> = {};
	let loc = "";


	for (let xx = x; xx < x + width; xx++) {
		for (let yy = y; yy < y + height; yy++) {
			let visible = world.vision.getVision(xx, yy) > 0.99;
			let fog = world.getFog(xx, yy) != TileType.Invalid;
			if (showGrid) {
				if (xx % 5 == 0 && yy % 5 == 0) {
					DrawText(
						screen, screen.spriteCache,
						"gridlab_" + xx + ',' + yy, {
							X: offsetx + (xx-x) * gridSize + gridSize*0.5,
							Y: offsety + (yy-y) * gridSize + gridSize*0.5,
							Text: xx + ',' + yy,
							Color: TEXTCOLOR,
							BackColor: "#000000",
							zIndex: 5,
							align: "center",
							FontSize: 24,
						}
					)
				}
			}
			if (visible || fog) {
				// Draw tile
				loc = xx + ',' + yy;
				if (visible) newVis[loc] = tile;
				if (newVis[loc] != screen.tileVis[loc]) {
					screen.tileGlitch[loc] = GLITCH_TILE;
				}
				if (!screen.tileGlitch[loc]) {
					newVisFog[loc] = tile;
				}
				tile = world.getTile(xx, yy);
				if (tile != TileType.Invalid) {
					screen.Draw(`tt_${offsetx}_${offsety}_${xx}_${yy}`, TileProperties[tile].sprite(skin),
						offsetx + (xx-x) * gridSize,
						offsety + (yy-y) * gridSize,
						gridSize,
						gridSize,
						{
							alpha: visible ? 1 : 0.5,
							tint: Engine.glitchEnabled ? (screen.tileGlitch[loc] ? getGlitchColor() : 0xffffff) : undefined,
						}, 0.1,
						screen.tileVisFog[loc] ? undefined : screen.tileGlitch[loc]
					)
				}
			}

			if (visible) {
				// Draw actor

				actor = world.getActor(xx, yy);
				if (actor) {
					screen.Draw(`act_${actor.id}`, actorTypes[actor.type]?.sprite(),
						offsetx + (xx-x) * gridSize,
						offsety + (yy-y) * gridSize,
						gridSize,
						gridSize,
						{
							zIndex: 9,

						}
					)
					if (screen.selectedActor == actor) {
						screen.Draw(`act_sel`, "tiles/Grid.png",
						offsetx + (xx-x - 0.5) * gridSize,
						offsety + (yy-y - 0.5) * gridSize,
						gridSize*2,
						gridSize*2,
						{
							zIndex: 9,

						}
					)
					}
					if (showCallsign && actor != world.getPlayer()) {
						let callsign = world.getCallsign(actor);
						if (callsign) {
							DrawText(
								screen, screen.spriteCache,
								"cs_" + callsign, {
									X: offsetx + (xx-x) * gridSize + gridSize*0.5,
									Y: offsety + (yy-y) * gridSize + gridSize*0.05,
									Text: callsign,
									Color: TEXTCOLOR,
									BackColor: "#000000",
									zIndex: 80,
									align: "center",
									FontSize: 24,
								}
							)
						}

					}
				}
			}
		}
	}
	screen.tileVis = newVis;
	screen.tileVisFog = newVisFog;
}

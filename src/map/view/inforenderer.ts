
import { utils } from "pixi.js";
import { DrawRect, DrawText, FillRect, getGlitchColor } from "../../core/draw";
import { Engine, HEIGHT, WIDTH } from "../../core/engine";
import { BUTTON_COLOR, GLITCH_BASE, TEXTCOLOR, TEXTOLCOLOR, UI_HIGHLIGHT } from "../../core/params";
import { GameBoard } from "../../states/game/gameboard";
import { Localize } from "../../text/localize";
import { Actor, Actors } from "../actor/actor";
import { actorTypes } from "../actor/actorList";
import { World } from "../world";


export function renderInfo(screen: GameBoard, world: World, offsetx: number, offsety: number, actor: Actor, size = 96*2, gridSize = 96) {
	if (actor != screen.infoActor) {
		screen.infoGlitch = Math.max(screen.infoGlitch, GLITCH_BASE);
	}

	for (let xx = 0; xx <= size + gridSize; xx+=gridSize) {
		for (let yy = 0; yy <= size + gridSize; yy+=gridSize) {
			screen.Draw(`ttbg_${xx}_${yy}`, "tiles/Grid.png",
			offsetx + (xx),
			offsety + (yy),
			gridSize,
			gridSize,
			{
				tint: Engine.glitchEnabled ? (Math.random() < 0.33 && screen.infoGlitch ? getGlitchColor() : 0xffffff) : undefined,
				zIndex: 90,
			}, 0.02,
			Math.max(0, screen.infoGlitch - 0.5*GLITCH_BASE*(1 - yy / (gridSize + size)))
		)
		}
	}

	if (actor) {
		screen.Draw(`act_info_${actor.id}`, actorTypes[actor.type]?.sprite(),
			offsetx + gridSize,
			offsety + gridSize,
			size,
			size,
			{
				zIndex: 100,
			}, 0.05,
			Math.max(0, screen.infoGlitch - GLITCH_BASE/2)
		)
		DrawText(screen, screen.spriteCache, "act_info_title", {
			X: offsetx + size/2 + gridSize,
			Y: offsety + size + 2*gridSize + 24,
			Text: Localize("Bot" + actor.type),
			BackColor: TEXTOLCOLOR,
			Color: TEXTCOLOR,
			align: "center",
			FontSize: 30,
		});

		let ii = 1;
		let spacing = 24;
		let fontsize = 22;
		let xpad = 8;
		let ypad = 32;

		DrawText(screen, screen.spriteCache, "act_infoid", {
			X: offsetx + xpad,
			Y: offsety + size + 2*gridSize + ypad + spacing*ii++,
			Text: Localize("InfoID") + world.getCallsign(actor),
			BackColor: TEXTOLCOLOR,
			Color: (Engine.glitchEnabled && screen.infoGlitch > 0) ? (utils.hex2string(getGlitchColor())) : TEXTCOLOR,
			align: "left",
			FontSize: fontsize,
		});
		DrawText(screen, screen.spriteCache, "act_infotype", {
			X: offsetx + xpad,
			Y: offsety + size + 2*gridSize + ypad + spacing*ii++,
			Text: Localize("InfoType") + Localize("BotShort" + actor.type),
			BackColor: TEXTOLCOLOR,
			Color: (Engine.glitchEnabled && screen.infoGlitch > 0) ? (utils.hex2string(getGlitchColor())) : TEXTCOLOR,
			align: "left",
			FontSize: fontsize,
		});
		DrawText(screen, screen.spriteCache, "act_infoclass", {
			X: offsetx + xpad,
			Y: offsety + size + 2*gridSize + ypad + spacing*ii++,
			Text: Localize("InfoClass") + Localize("BotClass" + actor.type),
			BackColor: TEXTOLCOLOR,
			Color: (Engine.glitchEnabled && screen.infoGlitch > 0) ? (utils.hex2string(getGlitchColor())) : TEXTCOLOR,
			align: "left",
			FontSize: fontsize,
		});
		ii++;
		if (Actors.isHostile(world.getPlayer(), actor) && actor.awareness > 0) {
			DrawText(screen, screen.spriteCache, "act_infoawareness", {
				X: offsetx + xpad,
				Y: offsety + size + 2*gridSize + ypad + spacing*ii++,
				Text: Localize(Actors.isAware(actor, world.getPlayer()) ? "InfoAware" : "InfoUnaware"),
				BackColor: TEXTOLCOLOR,
				Color: (Engine.glitchEnabled && screen.infoGlitch > 0) ? (utils.hex2string(getGlitchColor())) : TEXTCOLOR,
				align: "left",
				FontSize: fontsize,
			});
		} else {
			ii++;
		}

		DrawText(screen, screen.spriteCache, "act_inforelation", {
			X: offsetx + xpad,
			Y: offsety + size + 2*gridSize + ypad + spacing*ii++,
			Text: Localize(Actors.isHostile(world.getPlayer(), actor) ? "InfoHostile" :  "InfoNeutral"),
			BackColor: TEXTOLCOLOR,
			Color: (Engine.glitchEnabled && screen.infoGlitch > 0) ? (utils.hex2string(getGlitchColor())) : TEXTCOLOR,
			align: "left",
			FontSize: fontsize,
		});

		ii++;
		let security = "Low";
		DrawText(screen, screen.spriteCache, "act_infonetwork", {
			X: offsetx + xpad,
			Y: offsety + size + 2*gridSize + ypad + spacing*ii++,
			Text: Localize("InfoSecurity" + security),
			BackColor: TEXTOLCOLOR,
			Color: (Engine.glitchEnabled && screen.infoGlitch > 0) ? (utils.hex2string(getGlitchColor())) : TEXTCOLOR,
			align: "left",
			FontSize: fontsize,
		});

	}

	renderConsole(screen, world, offsetx, offsetx, actor, size, gridSize);
	renderListener(screen, world, offsetx, offsetx, actor, size, gridSize);

	screen.infoActor = actor;
}

function renderConsole(screen: GameBoard, world: World, ox: number, oy: number, actor: Actor, size = 96*2, gridSize = 96) {
	let cHeight = Math.floor(HEIGHT * 0.4);
	let textFieldheight = 64;

	FillRect(screen, screen.spriteCache, "consolebg", {
		Left: ox + 5,
		Top: HEIGHT - cHeight - 5,
		Width: WIDTH - ox - 10,
		Height: cHeight - textFieldheight - 5,
		Color: BUTTON_COLOR,
		alpha: 0.35 * Math.max(0, 1 - screen.infoGlitch/GLITCH_BASE),
		LineWidth: 2,
		zIndex: 9,
	});
	DrawRect(screen, screen.spriteCache, "consoleout", {
		Left: ox + 5,
		Top: HEIGHT - cHeight - 5,
		Width: WIDTH - ox - 10,
		Height: cHeight - textFieldheight - 5,
		Color: UI_HIGHLIGHT,
		alpha: 0.35,
		LineWidth: 2,
		zIndex: 10,
	});

	let max = 12;
	for (let i = 0; i < max && i < screen.console.length; i++) {
		DrawText(screen, screen.spriteCache, "console_" + i, {
			X: ox + 5 + 10,
			Y: HEIGHT - 10 - textFieldheight - 30 * (0.5 + i),
			Text: screen.console[i],
			BackColor: TEXTOLCOLOR,
			Color: (Engine.glitchEnabled && screen.infoGlitch > 0) ? (utils.hex2string(getGlitchColor())) : TEXTCOLOR,
			align: "left",
			FontSize: 24,
			alpha: 1.0 - 0.7 * i/max,
		});
	}

	let E = document.getElementById("GameConsole");
	if (E) {
		const HRatio = document.getElementById("pixi-canvas").clientHeight/HEIGHT;
		const WRatio = document.getElementById("pixi-canvas").clientWidth/WIDTH;
		const offsetLeft = document.getElementById("pixi-canvas").offsetLeft;
		const offsetTop = document.getElementById("pixi-canvas").offsetTop;

		Object.assign(E.style, {
			left: offsetLeft + WRatio*(ox + 5) + "px",
			top: offsetTop + HRatio*(HEIGHT - 5 - textFieldheight) + "px",
			width: WRatio*(WIDTH - ox - 10) + "px",
			height: HRatio*(textFieldheight) + "px",
		});
	}
}


function renderListener(screen: GameBoard, world: World, ox: number, oy: number, actor: Actor, size = 96*2, gridSize = 96) {
	let cHeight = Math.floor(HEIGHT * 0.4);

	screen.consoleListener = (actor || world.getPlayer()).cmdQueue.map(
		(cmd) => {
			let str: string = cmd.type;
			for (let arg of cmd.args) {
				str = str + ',' + arg;
			}
			return str;
		}
	);

	let max = 12;
	for (let i = 0; i < max && i < screen.consoleListener.length; i++) {
		DrawText(screen, screen.spriteCache, "consolelistener_" + i, {
			X: ox + size + gridSize*2 + 20,
			Y: 5 + gridSize*2 + size - 24*i,
			Text: screen.consoleListener[i],
			BackColor: TEXTOLCOLOR,
			Color: (Engine.glitchEnabled && screen.infoGlitch > 0) ? (utils.hex2string(getGlitchColor())) : TEXTCOLOR,
			align: "left",
			FontSize: 20,
			Width: 500,
			alpha: (1.0 - 0.7 * i/max) * (actor ? 1.0 : 0.5),
		});
	}
}
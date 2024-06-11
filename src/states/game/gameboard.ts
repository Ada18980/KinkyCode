
import { Engine, HEIGHT, WIDTH } from "../../core/engine";
import { GameScreen } from "../../core/gamescreen";
import { Localize } from "../../text/localize";
import { saveGame } from "../../core/user";
import { renderMap } from "../../map/view/maprenderer";
import { GameState } from "./game";
import { BUTTON_HIGHLIGHT, GLITCH_BASE, GRID_SIZE, TEXTCOLOR } from "../../core/params";
import { MapPoint } from "../../map/maputil";
import { DrawRect, FillRect } from "../../core/draw";
import { Actor, Actors } from "../../map/actor/actor";
import { CMD, movementAlias } from "../../map/actor/cmd";
import { renderInfo } from "../../map/view/inforenderer";
import { CMDType, CMDTypes } from "../../map/actor/cmdList";

export class GameBoard extends GameScreen {
	private _state: GameState;

	public mousePoint: MapPoint = {x: 0, y: 0};

	public tileGlitch: Record<string, number> = {};
	public tileVis: Record<string, number> = {};
	public tileVisFog: Record<string, number> = {};

	public infoGlitch: number = GLITCH_BASE;
	public infoActor: Actor = null;
	public selectedActor: Actor = null;


	constructor(state: GameState) {
		super();
		this._state = state;

		this._state = this._state;
	}

	FocusConsole = (event: KeyboardEvent) => {
		if (event.key != "Enter") {
			if (document.getElementById("GameConsole")) {
				if (event.key == "ArrowUp" || event.key == "ArrowRight") {
					this.consolePos = Math.min(this.console.length - 1, this.consolePos + 1);
					if (this.console[this.consolePos]) {
						let val = this.console[this.consolePos] || "";
						(document.getElementById("GameConsole") as any).value = val;
						(document.getElementById("GameConsole") as HTMLInputElement)
							.setSelectionRange(val.length, val.length);
					}
				} else if (event.key == "ArrowDown" || event.key == "ArrowLeft") {
					this.consolePos = Math.max(0, this.consolePos - 1);
					if (this.console[this.consolePos]) {
						let val = this.console[this.consolePos] || "";
						(document.getElementById("GameConsole") as any).value = val;
						(document.getElementById("GameConsole") as HTMLInputElement)
							.setSelectionRange(val.length, val.length);
					}
				}

				document.getElementById("GameConsole").focus();
			}

		}

	}
	EnterCommand = (event: KeyboardEvent) => {
		if (event.code == "Enter") {
			if (document.getElementById("GameConsole")) {
				document.getElementById("GameConsole").blur();
				let value: string = (document.getElementById("GameConsole") as any).value;
				value = value.toLocaleUpperCase();
				(document.getElementById("GameConsole") as any).value = "";

				console.log(value);
				value = value.trim();
				let vals = value.split(";");
				for (let val of vals) {
					this.sendCMD(val.trim());
				}
				this.consolePos = -1;
			}
		}

	}

	maxConsole: number = 1000;
	maxConsoleListener: number = 12;
	console: string[] = [];
	consoleListener: string[] = [];
	consolePos: number = 0;

	sendCMD(value: string) {
		if (this.selectedActor) {
			let cmdType: string = value.includes('(') ? value.substring(0, value.indexOf('(')) : value;
			let cmdArgsInput: string[] = value.includes('(') ? value.substring(1 + value.indexOf('(')).replace(')','').split(',') : [];
			let cmdArgs: string[] = [];
			cmdArgsInput.forEach((arg) => {
				let aliased = movementAlias(this._state.getWorld(), this.selectedActor, arg);
				cmdArgs.push(...aliased.split(','));
			})
			let type = CMDTypes[cmdType];
			if (this.selectedActor == this._state.getWorld().getPlayer()) {
				Actors.removeCMDByNoTag(this._state.getWorld().getPlayer(), "nocancel");
			}
			if (type) {
				this.sendCmdToSelectedActor(this.selectedActor, cmdType, cmdArgs);
				this.console.unshift(value);
			} else {
				this.console.unshift(Localize("ConsoleError"));
			}
		} else {
			let cmdType: string = value.includes('(') ? value.substring(0, value.indexOf('(')) : value;

			let type = CMDTypes[cmdType];
			if (type) {
				this.console.unshift(value);
			} else this.console.unshift(Localize("ConsoleError"));
			this.selectedActor = this._state.getWorld().getPlayer();
		}
	}

	sendCmdToSelectedActor(actor: Actor, type: string, args: string[]) {
		Actors.addCMD(actor, new CMD(
			type,
			args
		));
	}


	override doInit(): void {
		window.addEventListener("keydown", this.FocusConsole);
		window.addEventListener("keydown", this.EnterCommand);
	}
	override doTerminate() {
		if (document.getElementById("GameConsole"))
			document.getElementById("GameConsole").style.display = "none";

		window.removeEventListener("keydown", this.FocusConsole);
		window.removeEventListener("keydown", this.EnterCommand);
	}


	override doClick(): boolean {
		let ox = (HEIGHT - Math.floor(HEIGHT/GRID_SIZE)*GRID_SIZE) / 2;
		let oy = (HEIGHT - Math.floor(HEIGHT/GRID_SIZE)*GRID_SIZE) / 2;
		if (Engine.MouseIn(ox, oy, Math.floor(HEIGHT/GRID_SIZE)*GRID_SIZE, Math.floor(HEIGHT/GRID_SIZE)*GRID_SIZE)) {

			let player = this._state.getWorld().getPlayer();
			let target = this._state.getWorld().getActor(this.mousePoint.x, this.mousePoint.y);
			if (target && this._state.getWorld().vision.getVision(target.x, target.y) == 0) {
				target = null;
			}
			if (player) {
				if (player.cmdQueue.length == 0 && (this.mousePoint.x != player.x || this.mousePoint.y != player.y)) {

					if (target) {
						this.selectedActor = target;
						return true;
					}

					let pathToCursor = this._state.getWorld().findPath(
						player.x,
						player.y,
						this.mousePoint.x,
						this.mousePoint.y,
						player, true, false, true,
					);
					if (pathToCursor?.length > 0) {
						Actors.removeCMDByNoTag(player, "nocancel");
						for (let point of pathToCursor) {
							Actors.addCMD(player, new CMD(
								"WALK",
								[point.x + "", point.y + ""]
							));
						}
						// TODO updatecommands
						return true;
					}
				}
			}

			this.selectedActor = target;

			return true;
		}
		return false;
	}

	private processGlitch(delta: number) {
		for (let tg of Object.entries(this.tileGlitch)) {
			this.tileGlitch[tg[0]] = Math.max(0, tg[1] - delta);
		}
		for (let tg of Object.entries(this.tileGlitch)) {
			if (this.tileGlitch[tg[0]] <= 0) delete this.tileGlitch[tg[0]];
		}
		if (this.infoGlitch > 0) {
			this.infoGlitch = Math.max(0, this.infoGlitch - delta);
		}
	}

	override doDraw(delta: number) {
		delta = delta;

		this.processGlitch(delta);


		// Draw the exit button
		this.DrawButton(
			"start",
			Localize("SaveQuit"),
			undefined,
			undefined,
			() => {
				saveGame(this._state.getWorld());
				Engine.setState("Menu", true, {});
				return true;
			},
			WIDTH - 200,
			10,
			190, 64,
			10,
			undefined,
			undefined,
		);
		// Draw the wait button
		this.DrawButton(
			"wait",
			Localize("Wait"),
			undefined,
			undefined,
			() => {
				let player = this._state.getWorld().getPlayer();
				if (player) {
					if (!this.selectedActor)
						this.selectedActor = player;
					if (player.cmdQueue.length == 0) {
						Actors.addCMD(player, new CMD(
							"WAIT"
						))
					} else {
						Actors.removeCMDByNoTag(player, "nocancel");
					}
				}
				return true;
			},
			WIDTH - 450,
			10,
			190, 64,
			10,
			undefined,
			undefined,
		);

		this._state.getWorld().updateActorCache();
		let player = this._state.getWorld().getPlayer();
		if (player) {
			let ox = (HEIGHT - Math.floor(HEIGHT/GRID_SIZE)*GRID_SIZE) / 2;
			let oy = (HEIGHT - Math.floor(HEIGHT/GRID_SIZE)*GRID_SIZE) / 2;
			let cx = player.x - Math.floor(HEIGHT/GRID_SIZE/2);
			let cy = player.y - Math.floor(HEIGHT/GRID_SIZE/2);

			this.processMouse(player, ox, oy, cx, cy);

			let selectedActor: Actor = this.selectedActor || this._state.getWorld().getActor(this.mousePoint.x, this.mousePoint.y);

			if (selectedActor && this._state.getWorld().vision.getVision(selectedActor.x, selectedActor.y) == 0) {
				this.selectedActor = null;
				selectedActor = null;
			}

			renderMap(this,	this._state.getWorld(),
			ox, oy,
			cx, cy,
			Math.floor(HEIGHT/GRID_SIZE), Math.floor(HEIGHT/GRID_SIZE), GRID_SIZE,
			!Engine.MouseIn(ox, oy, Math.floor(HEIGHT/GRID_SIZE)*GRID_SIZE, Math.floor(HEIGHT/GRID_SIZE)*GRID_SIZE)
				|| selectedActor != null,
			document.activeElement == document.getElementById("GameConsole"));


			renderInfo(this,	this._state.getWorld(),
			HEIGHT + ox, oy,
			selectedActor,
			GRID_SIZE*4, GRID_SIZE*2);


		}


	}
	processMouse(player: Actor, ox: number, oy: number, cx: number, cy: number) {
		if (Engine.MouseIn(ox, oy, Math.floor(HEIGHT/GRID_SIZE)*GRID_SIZE, Math.floor(HEIGHT/GRID_SIZE)*GRID_SIZE)) {

			this.mousePoint = {
				x: player.x - Math.floor(HEIGHT/GRID_SIZE/2) + Math.round((Engine.MouseX - GRID_SIZE/2 - ox)/GRID_SIZE),
				y: player.y - Math.floor(HEIGHT/GRID_SIZE/2) + Math.round((Engine.MouseY - GRID_SIZE/2 - ox)/GRID_SIZE),
			};
			FillRect(this, this.spriteCache, "cursorbg", {
				Left: ox + (this.mousePoint.x - cx)*GRID_SIZE,
				Top: oy + (this.mousePoint.y - cy)*GRID_SIZE,
				Width: GRID_SIZE,
				Height: GRID_SIZE,
				Color: BUTTON_HIGHLIGHT,
				alpha: 0.2,
				LineWidth: 2,
				zIndex: 50,
			});
			DrawRect(this, this.spriteCache, "cursor", {
				Left: ox + (this.mousePoint.x - cx)*GRID_SIZE,
				Top: oy + (this.mousePoint.y - cy)*GRID_SIZE,
				Width: GRID_SIZE,
				Height: GRID_SIZE,
				Color: TEXTCOLOR,
				LineWidth: 2,
				zIndex: 50,
			});
			let pathToCursor = this._state.getWorld().findPath(
				player.x,
				player.y,
				this.mousePoint.x,
				this.mousePoint.y,
				player, true, false, true,
			);
			if (pathToCursor?.length > 0) {
				for (let point of pathToCursor) {
					FillRect(this, this.spriteCache, "cursorbg" + point.x + ',' + point.y, {
						Left: ox + (point.x - cx)*GRID_SIZE,
						Top: oy + (point.y - cy)*GRID_SIZE,
						Width: GRID_SIZE,
						Height: GRID_SIZE,
						Color: BUTTON_HIGHLIGHT,
						alpha: 0.35,
						LineWidth: 2,
						zIndex: 40,
					});
				}
			}
		}
	}
}
import { decompressFromBase64 } from "lz-string";
import { State } from "../../core/state";
import { World } from "../../map/world";
import { GameBoard } from "./gameboard";
import { TICK_BATCH, TIME_TICK_MS, UI_HIGHLIGHT } from "../../core/params";

let ConsoleStyle = {
	backgroundColor: "#000000a0",
	fontFamily: "'Courier New'",
	fontSize: "18px",
	color: UI_HIGHLIGHT,
	lineHeight: 1.6,

	position: "fixed",
	display: "inline"
};

interface GameArgs {
	saveData: string,
}

export class GameState extends State {
	private _world: World;
	private _saveData: string = "";

	constructor(args: GameArgs) {
		super(args);
		this.setScreen(new GameBoard(this));

		if (args?.saveData) {
			this._saveData = args.saveData;
			this.loadWorld(args.saveData);
		} else {
			try {
				let dat = localStorage.getItem("save");
				this._saveData = decompressFromBase64(dat);
			} catch (err) {
				console.log(err);
			}
		}
		let ID = "GameConsole";

		if (!document.getElementById(ID)) {
			var TextArea = document.createElement("TextArea");
			TextArea.setAttribute("ID", ID);
			TextArea.setAttribute("name", ID);
			TextArea.setAttribute("autocapitalize", "off");
			TextArea.setAttribute("autocomplete", "off");
			TextArea.setAttribute("autocorrect", "off");
			TextArea.setAttribute("spellcheck", "false");
			//TextArea.addEventListener("keydown", KeyDown);
			TextArea.className = "HideOnPopup";
			Object.assign(TextArea.style, ConsoleStyle);
			document.body.appendChild(TextArea);
		}

		document.getElementById(ID).style.display = "inline";
	}


	override doInit(): void {
		if (!this._world)
			this._world = new World(this._saveData);
	}

	public loadWorld(saveData = "") {
		if (saveData) {
			this._saveData = saveData;
			this._world = new World(saveData);
		}


		this.initialized = true;
	}

	public getWorld(): World {
		return this._world;
	}



	lastTick: number = Date.now();

	override update(delta: number) {
		super.update(delta);
		this._world.updateLighting();
		let player = this._world?.getPlayer();
		if (player?.cmdQueue.length > 0 || player?.cooldown > 0) {
			this.tickLoop();
			this._world.updateLighting();
		}
	}
	tickLoop() {
		if (Date.now() - this.lastTick > TIME_TICK_MS) {
			for (let i = 0; i < TICK_BATCH; i++) {
				if (this._world.tick(false, true)) break;
			}
			this.lastTick = Date.now();
		}

	}
}

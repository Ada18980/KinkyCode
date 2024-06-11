import { Container, Filter } from "pixi.js";
import { Button } from "../ui/button";
import { Engine, mouseClicked } from "./engine";
import { DrawRect, DrawText, FillRect, KDDraw, primitiveparams } from "./draw";
import { BUTTON_CLICK, BUTTON_COLOR, BUTTON_HIGHLIGHT, GLITCH_BASE, TEXTCOLOR, TEXTOLCOLOR, UI_HIGHLIGHT } from "./params";

const CULLTIME = 15000;

/**
 * Game screen class for drawing the game
 * Instead of an update event we have a draw event
 *
 * Compare to: State, a class for storing information and running different states of the game
 * Compare to: World, a class for storing a Map and related data, and performing operations on the game data
 * Compare to: InputHandler, a class which receives inputs and passes them along to the game world in the order which they were received
 */
export abstract class GameScreen extends Container {
	//protected _state: State;
	protected buttonCache: Record<string, Button> = {};
	protected last_buttonCache: Record<string, Button> = {};
	public spriteCache: Map<string, Container> = new Map();
	public spritesDrawn: Map<string, boolean> = new Map();
	protected lastCull: Map<Map<string, Container>, number> = new Map();


	/** All states start with Glitch, Glitch is reduced when rendering */
	public glitchAmount: number = GLITCH_BASE;
	public glitch(mult = 1) {
		this.glitchAmount = mult*GLITCH_BASE;
	}

	public constructor() { // state: State
		super();
		this.sortableChildren = true;
		//this._state = state;
	}
	/** Called when entering the state */
	public doInit() {
	}
	/** Called when leaving the state */
	public doTerminate() {
	}

	public click() : boolean {
		if (this.ProcessButtons()) return true;
		if (this.doClick()) return true;
		return false;
	}

	public doClick() : boolean {
		return false;
	}





	private ProcessButtons() {
		let buttons: Button[] = [];
		for (let button of Object.entries(this.buttonCache)) {
			if (button[1].callback) {
				if (Engine.MouseIn(button[1].Left, button[1].Top, button[1].Width, button[1].Height)) {
					buttons.push(button[1]);
				}
			}
		}
		if (buttons.length > 0) {
			buttons = buttons.sort((a, b) => {return b.priority - a.priority;});
			if (buttons[0].callback(buttons[0])) return true;
		}

		return false;
	}

	public draw(delta: number) {
		this.last_buttonCache = this.buttonCache;
		this.buttonCache = {};

		this.glitchAmount = Math.max(0, this.glitchAmount - delta);

		this.doDraw(delta);

		this.CullSprites();
		this.spritesDrawn = new Map();
	}

	protected doDraw(delta: number) {
		delta = delta;
	}

	private CullSprites(list: Map<string, Container> = this.spriteCache) {
		if (!this.lastCull.get(list)) this.lastCull.set(list, 0);
		let cull = Engine.Time() > (this.lastCull.get(list) || 0) + CULLTIME;
		for (let sprite of list.entries()) {
			if (!this.spritesDrawn.has(sprite[0])) {
				if (cull) {
					if (primitiveparams.has(sprite[0])) primitiveparams.delete(sprite[0]);
					sprite[1].parent.removeChild(sprite[1]);
					list.delete(sprite[0]);
					sprite[1].destroy();
				} else sprite[1].visible = false;
			}
		}
	}

	public DrawButton(
		name: string,
		label: string,
		color: string,
		bgcolor: string,
		/** True = stop checking buttons, False = pass thru */
		callback: (button: Button) => boolean,
		Left: number,
		Top: number,
		Width: number,
		Height: number,
		priority: number = 0,
		hotkey?: string,
		scroll?: (amount: number) => void,
	) : boolean {
		let hover = Engine.MouseIn(Left, Top, Width, Height);
		DrawText(this, this.spriteCache, "bt_t_" + name, {
			Text: label,
			X: Left + Width/2,
			Y: Top + Height/2,
			Color: color || TEXTCOLOR,
			BackColor: bgcolor || TEXTOLCOLOR,
			align: 'center',
			zIndex: priority + 0.1,
		});


		FillRect(this, this.spriteCache, "bt_b_" + name, {
			Color: hover ? (mouseClicked ? BUTTON_CLICK : BUTTON_HIGHLIGHT) : BUTTON_COLOR,
			Height: Height,
			Left: Left,
			Top: Top,
			Width: Width,
			LineWidth: 2,
			zIndex: priority,
			alpha: 0.5,
		});
		DrawRect(this, this.spriteCache, "bt_e_" + name, {
			Color: UI_HIGHLIGHT,
			Height: Height,
			Left: Left,
			Top: Top,
			Width: Width,
			LineWidth: 2,
			zIndex: priority + 0.1,
			alpha: 0.5,
		});

		if (!this.buttonCache[name])
			this.buttonCache[name] = new Button(
				callback,
				Left,
				Top,
				Width,
				Height,
				priority,
				hotkey,
				scroll,
		);
		return hover;
	}


	public Draw(
		id: string,
		Image: string,
		Left: number,
		Top: number,
		Width: number,
		Height: number,
		options?: {
			SpritesDrawn?: Map<string, boolean>,
			Centered?: boolean,
			Scale?: number,
			scalex?: number,
			scaley?: number,
			anchorx?: number,
			anchory?: number,
			zIndex?: number,
			normalizeAnchorX?: number,
			normalizeAnchorY?: number,
			Rotation?: number,
			filters?: Filter[],
			tint?: number,
			alpha?: number,
			noGlitch?: boolean,
		},
		glitchMult?: number,
		extraGlitch?: number,
	) {
		KDDraw(
			this,
			this.spriteCache,
			id,
			Image,
			Left,
			Top,
			Width,
			Height,
			options,
			glitchMult,
			extraGlitch
		);
	}

}
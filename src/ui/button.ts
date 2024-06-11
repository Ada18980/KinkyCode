import { Graphics } from "pixi.js";

export class Button extends Graphics {

	/** True = stop checking buttons, False = pass thru */
	callback: (button: Button) => boolean;
	Left: number;
	Top: number;
	Width: number;
	Height: number;
	priority: number = 0;
	hotkey?: string;
	scroll?: (amount: number) => void;

	constructor(
		callback: (button: Button) => boolean,
		Left: number,
		Top: number,
		Width: number,
		Height: number,
		priority: number = 0,
		hotkey?: string,
		scroll?: (amount: number) => void,) {
		super();

		this.callback = callback;
		this.Left = Left;
		this.Top = Top;
		this.Width = Width;
		this.Height = Height;
		this.zIndex = priority;
		this.hotkey = hotkey;
		this.scroll = scroll;
	}

}
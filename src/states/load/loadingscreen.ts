import { SmoothGraphics as Graphics } from "@pixi/graphics-smooth";
import { Engine } from "../../core/engine";
import { Container, Point, Sprite } from "pixi.js";
import { GameScreen } from "../../core/gamescreen";
import { LoadingState } from "./load";

export class LoadingScreen extends GameScreen {
	private _logoContainer: Container;
	private _loadingCircle: Graphics;
	private _loadingBar: Graphics;
	private _logo: Sprite;

	private _radius = Engine.height * 0.4;
	private _barPercent = 0.9;

	private _state: LoadingState;

	constructor(state: LoadingState) {
		super();
		this._state = state;

		this._logoContainer = new Container();
		this._logoContainer.position = new Point(Engine.width/2, Engine.height/2);

		this._loadingCircle = new Graphics();
		this._loadingCircle.beginFill(0x000000);
		this._loadingCircle.drawCircle(0, 0, this._radius);
		this._loadingCircle.endFill();
		this._loadingCircle.position = new Point(Engine.width/2, Engine.height/2);

		this._loadingBar = new Graphics();

		this._logo = Sprite.from('Logo.png');
		this._logo.width = this._radius * 2 * this._barPercent;
		this._logo.height = this._radius * 2 * this._barPercent;
		this._logo.anchor.x = 0.5;
		this._logo.anchor.y = 0.5;
		this._logo.mask = this._loadingBar;
		this._logo.addChild(this._loadingBar);
		//this._logoContainer.mask = this._loadingBar;

		//this.addChild(this._loadingCircle);
		this._logoContainer.addChild(this._logo);
		this.addChild(this._logoContainer);


	}


	override doDraw(delta: number) {
		delta = delta;

		let bar = this._loadingBar;
		bar.clear();

		// The maths
		let phase = (Math.PI * 2) * this._state.loadProgress / this._state.loadProgressMax;
		const angleStart = 0 - Math.PI / 2; // Start 90 degrees
		const angle = phase + angleStart;
		const radius = this._radius * this._barPercent;

		const x1 = Math.cos(angleStart) * radius;
		const y1 = Math.sin(angleStart) * radius;

		// Redraw loading bar
		bar.clear();
		bar.lineStyle(2, 0xffffff, 1);
		bar.beginFill(0xffffff, 1);
		bar.moveTo(0, 0);
		bar.lineTo(x1, y1);
		bar.arc(0, 0, radius, angleStart, angle, false);
		bar.lineTo(0, 0);
		bar.endFill();

	}
}
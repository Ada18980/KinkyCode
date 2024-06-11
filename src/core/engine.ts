import {Application, SCALE_MODES, BaseTexture} from 'pixi.js';
import { State } from './state';

export const WIDTH = 1920;
export const HEIGHT = 1080;
export let mouseClicked = false;

/**
 * Engine class, basically runs the game and handles stuff like display management
 */
export class Engine {
	private constructor() { }

    private static app: Application;

    private static _width: number;
    private static _height: number;
    private static ratio: number;

	private static _CurrentState: State;
    public static get State(): State {return Engine._CurrentState;}
    public static set State(NewState: State) {
		if (NewState != Engine._CurrentState) {
			// Destroy the old state if it exists
			if (Engine._CurrentState) {
				Engine.app.stage.removeChild(Engine._CurrentState);
				Engine._CurrentState.destroy();
			}
			// Add new state
			Engine._CurrentState = NewState;
			Engine.app.stage.addChild(Engine._CurrentState);
		}
	}

    public static get width(): number {
        return Engine._width;
    }
    public static get height(): number {
        return Engine._height;
    }

	/**
	 * Initiates the game
	 * @param width The width of the game screen
	 * @param height The height of the game screen
	 */
	public static init(width: number, height: number, entryState: string) {
		Engine._width = width;
		Engine._height = height;
		Engine.ratio = width / height;

		Engine.app = new Application({
			view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
			resolution: window.devicePixelRatio || 1,
			autoDensity: true,
			backgroundColor: 0x000000,
			width: width,
			height: height,
		});

		document.getElementById("pixi-canvas").onmousemove = Engine.MouseMove;
		window.addEventListener("mousedown", Engine.MouseDown);
		window.addEventListener("mouseup", Engine.MouseUp);

		Engine.app.ticker.add(Engine.update)

        // listen for the browser telling us that the screen size changed
        window.addEventListener("resize", Engine.resize);
        window.addEventListener("click", Engine.click);


        // call it manually once so we are sure we are the correct size after starting
        Engine.resize();

		this.setState(entryState, false, {});
	}

	public static setState(state: string, terminate: boolean = false, args: object) {
		if (this.StateList[state]) {
			if (terminate)
				Engine.State.terminate();
			Engine.State = new (this.StateList[state])(args);
			Engine.State.init();
			Engine.State.glitch();
		}
	}
	public static registerState(state: typeof State, name: string) {
		this.StateList[name] = state;
	}

	private static StateList: Record<string, typeof State> = {};


    public static resize(): void {
		if (window.innerWidth / window.innerHeight >= Engine.ratio) {
			var w = window.innerHeight * Engine.ratio;
			var h = window.innerHeight;
		} else {
			var w = window.innerWidth;
			var h = window.innerWidth / Engine.ratio;
		}
		if (Engine.app.view.style) {
			Engine.app.view.style.width = w + 'px';
			Engine.app.view.style.height = h + 'px';
		}
    }

	public static update(delta: number) {
		// Do game stuff
		if (Engine._CurrentState) {
			Engine._CurrentState.update(delta);
			Engine._CurrentState.draw(delta);
		}
	}
	public static click(event: MouseEvent) {
		Engine.MouseMove(event);
		if (Engine._CurrentState) {
			Engine._CurrentState.click();
		}
	}

	public static setScaleMode(scaleMode: SCALE_MODES) {
		BaseTexture.defaultOptions.scaleMode = scaleMode;
	}

	static MouseMove(event: MouseEvent): void {
		if (document.getElementById("pixi-canvas") && (document.activeElement?.id == "MainCanvas" || document.activeElement?.id == document.getElementById("pixi-canvas").id || document.activeElement?.id == '')) {
			Engine.MouseX = Math.round(event.offsetX * WIDTH / document.getElementById("pixi-canvas").clientWidth);
			Engine.MouseY = Math.round(event.offsetY * HEIGHT / document.getElementById("pixi-canvas").clientHeight);
		}
	}


	static MouseDown(): void {
		mouseClicked = true;
	}
	static MouseUp(): void {
		mouseClicked = false;
	}

	public static glitchEnabled = true;

	/**
	 * Gets the current time in ms
	 */
	public static Time(): number {
		return Date.now();
	}


	static MouseX: number = 0;
	static MouseY: number = 0;

	static MouseIn(Left: number, Top: number, Width: number, Height: number): boolean {
		return Engine.MouseXIn(Left, Width) && Engine.MouseYIn(Top, Height);
	}
	static MouseXIn(Left: number, Width: number): boolean {
		return (Engine.MouseX >= Left) && (Engine.MouseX <= Left + Width);
	}
	static MouseYIn(Top: number, Height: number): boolean {
		return (Engine.MouseY >= Top) && (Engine.MouseY <= Top + Height);
	}
}
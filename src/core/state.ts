import { Container } from "pixi.js";
import { GameScreen } from "./gamescreen";



/**
 * Game state class for storing game states
 * All states extend from this one
 * Example states include the loading screen, title menu, game select, and game itself
 *
 * Compare to: GameScreen, a class for handling the interface of the game, displaying the map, and passing actions to the InputHandler
 * Compare to: World, a class for storing a Map and related data, and performing operations on the game data
 * Compare to: InputHandler, a class which receives inputs and passes them along to the game world in the order which they were received
 */
export class State extends Container {
	private Screen?: GameScreen;
	public constructor(args: object) {
		super();
		args = args;
	}

	protected initialized = false;
	/** Called when entering the state */
	public init() {
		this.doInit();
		if (this.Screen)
			this.Screen.doInit();
		this.initialized = true;
	}
	/** Called when leaving the state */
	public terminate() {
		this.doTerminate();
		if (this.Screen)
			this.Screen.doTerminate();
		this.initialized = false;
	}
	/** Called when entering the state */
	public doInit() {
	}
	/** Called when leaving the state */
	public doTerminate() {
	}


	public setScreen(screen: GameScreen) {
		if (this.Screen) this.removeChild(this.Screen);
		this.Screen = screen;
		this.addChild(this.Screen);
	}


	public glitch(mult = 1) {
		if (this.Screen) this.Screen.glitch(mult);
	}

	public update(delta: number) {
		delta = delta;
		// Do update stuff
	}
	public draw(delta: number) {
		if (this.Screen)
			this.Screen.draw(delta);
	}


	public click() : boolean{
		if (this.Screen)
			return this.Screen.click();
		return false;
	}





}
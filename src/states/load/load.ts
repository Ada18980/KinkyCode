import { State } from "../../core/state";
import { Engine } from "../../core/engine";
import { LoadingScreen } from "./loadingscreen";

export class LoadingState extends State {

	public loadProgress: number = 0;
	public loadProgressMax: number = 10;

	constructor(args: object) {
		super(args);
		this.setScreen(new LoadingScreen(this));
	}


	override update(delta: number) {
		this.loadProgress = Math.min(this.loadProgressMax, delta + this.loadProgress);

		if (this.loadProgress == this.loadProgressMax) {
			Engine.setState("Menu", false, {});
		}

		super.update(delta);
	}
}

//Engine.registerState(LoadingState, "Loading");
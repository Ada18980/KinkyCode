import { State } from "../../core/state";
import { MenuScreen } from "./menuscreen";

export class MenuState extends State {


	constructor(args: object) {
		super(args);
		this.setScreen(new MenuScreen(this));
	}


	override update(delta: number) {

		super.update(delta);
	}
}
import { decompressFromBase64 } from "lz-string";
import { Engine, HEIGHT, WIDTH } from "../../core/engine";
import { GameScreen } from "../../core/gamescreen";
import { Localize } from "../../text/localize";
import { MenuState } from "./menu";
import { DrawText } from "../../core/draw";
import { TEXTCOLOR, TEXTOLCOLOR } from "../../core/params";

export class MenuScreen extends GameScreen {
	private _state: MenuState;

	constructor(state: MenuState) {
		super();
		this._state = state;
		this._state = this._state;




	}


	override doDraw(delta: number) {
		delta = delta;
		// draw the surrender hint
		DrawText(this, this.spriteCache, "failInfo", {
			Text: Localize("SurrenderInfo"),
			X: WIDTH/2,
			Y: HEIGHT*0.5 + 250,
			Color: TEXTCOLOR,
			BackColor: TEXTOLCOLOR,
			align: 'center',
		});
		// Info
		DrawText(this, this.spriteCache, "intro", {
			Text: Localize("Intro"),
			X: WIDTH/2,
			Y: HEIGHT*0.25,
			Color: TEXTCOLOR,
			BackColor: TEXTOLCOLOR,
			align: 'center',
		});
		// Draw the start button
		this.DrawButton(
			"start",
			Localize("PressStart"),
			undefined,
			undefined,
			() => {
				let data = "";
				try {
					data = decompressFromBase64(localStorage.getItem("save"));
				} catch (err) {
					console.log(err);
				}
				Engine.setState("Game", true, {
					saveData: data,
				});
				return true;
			},
			WIDTH/2 - 200,
			HEIGHT*0.5,
			400, 64,
			10,
			undefined,
			undefined,
		);
		// Draw the reset button
		this.DrawButton(
			"reset",
			Localize("PressReset"),
			undefined,
			undefined,
			() => {
				localStorage.setItem("save", "");
				Engine.setState("Game", true, {
					saveData: "",
				});
				return true;
			},
			WIDTH/2 - 200,
			HEIGHT*0.5 + 128,
			400, 64,
			10,
			undefined,
			undefined,
		);

		// Draw the reset button
		this.DrawButton(
			"disableGlitch",
			Localize(Engine.glitchEnabled ? "GlitchDisable" : "GlitchEnable"),
			undefined,
			undefined,
			() => {
				Engine.glitchEnabled = !Engine.glitchEnabled;
				return true;
			},
			WIDTH - 250,
			HEIGHT*0.1,
			240, 64,
			10,
			undefined,
			undefined,
		);

	}
}
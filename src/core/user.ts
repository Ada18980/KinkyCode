import { compressToBase64 } from "lz-string";
import { World } from "../map/world";

export function saveGame(world: World) {
	try {
		let saveData = world.getSaveData();
		saveData = compressToBase64(saveData);

		if (saveData) {
			localStorage.setItem("save", saveData);
		}
	} catch (err) {
		console.log(err);
	}
}
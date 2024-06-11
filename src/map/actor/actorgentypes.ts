
import { GameActors } from "../map";
import { ActorGen } from "../gen/mapgen";
import { randPoint } from "../maputil";
import { Actor, Actors } from "./actor";

export let ActorGenTypes: Record<string, ActorGen> = {
	Low: {
		genFunc: (type, world) => {
			let map = world.map;
			let actors = new GameActors([world.getPlayer()]);

			for (let room of Object.entries(map.mapRoomDef)) {
				let point = randPoint(room[1]);
				let actor = new Actor(
					world.getID(),
					"Maid",
					point.x,
					point.y
				);
				Actors.addActor(actor, actors);
			}

			return actors;
		}
	}
};
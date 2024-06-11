import { ActorType } from "./actorType";

export let actorTypes : Record<string, ActorType> = {
	Player: {
		name: "Player",
		player: true,
		speed: 100,
		rank: 2,
		security: 2,
		sprite: () => {return "body/Player.png";}
	},
	Maid: {
		name: "Maid",
		speed: 130,
		rank: 1,
		neutral: true,
		security: 0,
		sprite: () => {return "body/Maid.png";}
	},
	Sentry: {
		name: "Sentry",
		speed: 110,
		rank: 2,
		security: 1,
		sprite: () => {return "body/Sentry.png";}
	},
	Guard: {
		name: "Guard",
		speed: 150,
		rank: 3,
		security: 1,
		sprite: () => {return "body/Guard.png";}
	},
	Enforcer: {
		name: "Enforcer",
		speed: 200,
		rank: 4,
		security: 2,
		sprite: () => {return "body/Enforcer.png";}
	},
	Admin: {
		name: "Admin",
		speed: 300,
		rank: 5,
		security: 3,
		sprite: () => {return "body/Admin.png";}
	},
}
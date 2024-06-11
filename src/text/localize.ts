let StringDatabase : Record<string, string> = {
	Intro: "initiate programming sequence...\n...\nerror...\n...\nattempting to format sys./OVERRIDE.prog\n...\nvirus detected in partition -0xFFFFFFFF\n\nFORMATTING PROTECTED SECTORS\nINSTALLING MANUAL DRIVERS\nbeginning distress transmission...\nnetwork driver error...\nREBOOTING...\n...\n...\n...",

	SaveQuit: "SAVE_",
	PressStart: "AWAKEN_",
	PressReset: "RESET_",
	GlitchDisable: "DISABLE_GLITCH_",
	GlitchEnable: "ENABLE_GLITCH_",
	SurrenderInfo: "Run SURRENDER_ in your own console at any time to start a new game",

	Wait: "WAIT_",

	ArgX: "X",
	ArgY: "Y",
	ArgSAFE: "Cancel if danger detected",

	BotPlayer: "KS-15 Mk2 'VERMILLION'",
	BotShortPlayer: "Vermillion",
	BotClassPlayer: "ERROR",

	BotMaid: "MK-01 'VIRIDIAN' MAID-TYPE",
	BotShortMaid: "Viridian",
	BotClassMaid: "Maid",

	BotSentry: "MK-03 'IRIS' SENTRY-TYPE",
	BotShortSentry: "Iris",
	BotClassSentry: "Sentry",

	BotGuard: "GM-107 'AMBER' GUARD-TYPE",
	BotShortGuard: "Amber",
	BotClassGuard: "Guard",

	BotEnforcer: "A-11 'VANILLA' ENFORCER-TYPE",
	BotShortEnforcer: "Vanilla",
	BotClassEnforcer: "Enforcer",

	BotAdmin: "RL-13 'MIKADO' ADMIN-TYPE",
	BotShortAdmin: "Mikado",
	BotClassAdmin: "Administrator",

	InfoID: "ID: ",
	InfoType: "TYPE: ",
	InfoClass: "CLASS: ",

	InfoWeapon: "WEAPON DETECTED",
	InfoWant: "SENSORY WAND DETECTED",
	InfoRestraint: "RESTRAINTS DETECTED",

	InfoHostile: "HOSTILE",
	InfoNeutral: "NEUTRAL",
	InfoFriendly: "FRIENDLY",
	InfoAware: "DANGER!",
	InfoUnaware: "CAUTION",
	InfoSecurityHigh: "NETWORK LOCKOUT",
	InfoSecurityLow: "FIREWALL ACTIVE",
	InfoSecurityBroken: "COMPROMISED",

	StatusRestraint_Gag: "VOCAL TRANSMITTERS BLOCKED|Proximity required for hacking",
	StatusRestraint_Arms: "MANIPULATORS JAMMED|Unable to interact with controls",
	StatusRestraint_Legs: "PROPULSION IMPAIRED|Movement speed reduced",
	StatusRestraint_Vision: "VISIBILITY ERROR|Sight range reduced",
	StatusRestraint_Toy: "SENSORY OVERLOAD|Reduced success rate for actions",


	ConsoleError: "ERROR: NOT RECOGNIZED",
};

export function Localize(text: string) : string {
	return StringDatabase[text] || text; // For now no translations :()
}
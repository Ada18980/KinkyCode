import { BaseTexture, Container, Filter, Graphics, SCALE_MODES, Sprite, Text, Texture, utils } from "pixi.js";
import { GameScreen } from "./gamescreen";
import { FONT } from "./params";
import { Engine } from "./engine";

interface RectParams extends Record<string, any> {
	Left: number,
	Top: number,
	Width: number,
	Height: number,
	Color: string,
	LineWidth: number,
	zIndex: number,
	alpha?: number,
}
export let primitiveparams = new Map<string, Record<string, any>>();

export function DrawRect(Container: GameScreen, Map: Map<string, Container>, id: string, Params: RectParams) {
	let sprite = Map.get(id);
	let same = true;
	if (sprite && primitiveparams.has(id)) {
		for (let p of Object.entries(primitiveparams.get(id))) {
			if (Params[p[0]] != p[1]) {
				same = false;
				break;
			}
		}
	}
	if (!sprite || !same) {
		if (sprite) sprite.destroy();
		// Make the prim
		let gfx = new Graphics();
		sprite = gfx;
		gfx.lineStyle(Params.LineWidth ? Params.LineWidth : 1, utils.string2hex(Params.Color), 1);
		gfx.drawRect(0, 0, Params.Width, Params.Height);
		// Add it to the container
		Map.set(id, sprite);
		Container.addChild(sprite);
		if (!primitiveparams.has(id) || !same)
			primitiveparams.set(id, Params);
	}
	if (sprite) {
		// Modify the sprite according to the params
		sprite.name = id;
		sprite.position.x = Params.Left;
		sprite.position.y = Params.Top;
		sprite.width = Params.Width;
		sprite.height = Params.Height;
		sprite.zIndex = Params.zIndex ? Params.zIndex : 0;
		sprite.alpha = Params.alpha ? Params.alpha : 1;
		Container.spritesDrawn.set(id, true);
		return true;
	}
	return false;
}
export function FillRect(Container: GameScreen, Map: Map<string, Container>, id: string, Params: RectParams) {
	let sprite = Map.get(id);
	let same = true;
	if (sprite && primitiveparams.has(id)) {
		for (let p of Object.entries(primitiveparams.get(id))) {
			if (Params[p[0]] != p[1]) {
				same = false;
				break;
			}
		}
	}
	if (!sprite || !same) {
		if (sprite) sprite.destroy();
		// Make the prim
		let gfx = new Graphics();
		sprite = gfx;
		gfx.beginFill(utils.string2hex(Params.Color));
		gfx.drawRect(0, 0, Params.Width, Params.Height);
		// Add it to the container
		Map.set(id, sprite);
		Container.addChild(sprite);
		if (!primitiveparams.has(id) || !same)
			primitiveparams.set(id, Params);
	}
	if (sprite) {
		// Modify the sprite according to the params
		sprite.name = id;
		sprite.position.x = Params.Left;
		sprite.position.y = Params.Top;
		sprite.width = Params.Width;
		sprite.height = Params.Height;
		sprite.zIndex = Params.zIndex ? Params.zIndex : 0;
		sprite.alpha = Params.alpha ? Params.alpha : 1;
		Container.spritesDrawn.set(id, true);
		return true;
	}
	return false;
}

interface TextParams extends Record<string, any> {
	Text: string,
	X: number,
	Y: number,
	Width?: number,
	Color: string,
	BackColor: string,
	FontSize?: number,
	align?: string,
	zIndex?: number,
	alpha?: number,
	border?: number,
	unique?: boolean,
	font?: string
}

export function DrawText(Container: GameScreen, Map: Map<string, Container>, id: string, Params: TextParams) {
	let sprite = Map.get(id);
	let same = true;
	let par = primitiveparams.get(id);
	if (sprite && par) {
		for (let p of Object.entries(primitiveparams.get(id))) {
			if (Params[p[0]] != p[1] && ((p[0] != 'X' && p[0] != 'Y') || !Params.unique)) {
				same = false;
				//if (!Params.unique)
				//console.log(p)
				break;
			}
		}
		for (let p of Object.entries(Params)) {
			if (par[p[0]] != p[1] && ((p[0] != 'X' && p[0] != 'Y') || !Params.unique)) {
				same = false;
				//if (!Params.unique)
				//console.log(p)
				break;
			}
		}
	}
	if (!sprite || !same) {
		if (sprite) sprite.destroy();
		// Make the prim
		let txt = new Text(Params.Text,
			{
				fontFamily : Params.font || FONT,
				fontSize: Params.FontSize ? Params.FontSize : 30,
				fill : utils.string2hex(Params.Color),
				stroke : Params.BackColor != "none" ? (Params.BackColor ? utils.string2hex(Params.BackColor) : "#333333") : 0x000000,
				strokeThickness: Params.border != undefined ? Params.border : (Params.BackColor != "none" ? (Params.FontSize ? Math.ceil(Params.FontSize / 8) : 2) : 0),
				miterLimit: 4,
			}
		);
		sprite = txt;

		//console.log(Params)
		if (Params.Width) {
			sprite.scale.x = Math.min(1, Params.Width / Math.max(1, sprite.width));
			sprite.scale.y = sprite.scale.x;
		}

		txt.roundPixels = true;
		// Add it to the container
		Map.set(id, sprite);
		Container.addChild(sprite);
		if (!primitiveparams.has(id) || !same)
			primitiveparams.set(id, Params);
	}
	if (sprite) {
		// Modify the sprite according to the params
		sprite.name = id;
		//sprite.cacheAsBitmap = true;
		sprite.position.x = Params.X + (Params.align == 'center' ? -sprite.width/2 : (Params.align == 'right' ? -sprite.width : 0));
		sprite.position.y = Params.Y - Math.ceil(sprite.height/2);
		sprite.zIndex = Params.zIndex ? Params.zIndex : 0;
		sprite.alpha = Params.alpha ? Params.alpha : 1;
		Container.spritesDrawn.set(id, true);
		return true;
	}
	return false;
}


let OPTIONS_NEAREST = {scaleMode: SCALE_MODES.NEAREST};

let errorImg: Record<string, boolean> = {};
let kdpixitex: Map<string, Texture> = new Map();

/**
 * Returns a PIXI.Texture, or null if there isnt one
 * @param {string} Image
 * @returns {any}
 */
function KDTex(Image: string, Nearest: boolean): Texture {
	if (kdpixitex.has(Image)) return kdpixitex.get(Image);
	if (errorImg[Image]) return null;
	try {
		let tex = Nearest ? Texture.from(Image, OPTIONS_NEAREST) : Texture.from(Image);
		if (!tex) {
			errorImg[Image] = true;
		} else {
			kdpixitex.set(Image, tex);
		}
		return tex;
	} catch (e) {
		console.log("Failed to find texture " + Image);
		return null;
	}
}

BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

export function KDDraw(
	Container: GameScreen,
	Map: Map<string, Container>,
	id: string,
	Image: string,
	Left: number,
	Top: number,
	Width: number,
	Height: number,
	options?: {
		SpritesDrawn?: Map<string, boolean>,
		Centered?: boolean,
		Scale?: number,
		scalex?: number,
		scaley?: number,
		anchorx?: number,
		anchory?: number,
		zIndex?: number,
		normalizeAnchorX?: number,
		normalizeAnchorY?: number,
		Rotation?: number,
		filters?: Filter[],
		tint?: number,
		noGlitch?: boolean,
		alpha?: number,
	},
	glitchMult = 0.1,
	extraGlitch?: number,
) {
	let sprite: Sprite = Map.get(id) as Sprite;
	if (!sprite) {
		let tex = KDTex(Image, true);

		if (tex) {
			// Create the sprite
			sprite = Sprite.from(KDTex(Image, true), {
				scaleMode: SCALE_MODES.NEAREST,
			});
			Map.set(id, sprite);
			// Add it to the container
			Container.addChild(sprite);
		}
	}
	if (sprite) {
		sprite.visible = true;
		//sprite.roundPixels = true;
		sprite.interactive = false;
		// Modify the sprite according to the params
		let tex = KDTex(Image, true);
		if (tex) sprite.texture = tex;
		sprite.name = id;
		if (Engine.glitchEnabled && (extraGlitch || (!options?.noGlitch && Container.glitchAmount && glitchMult > 0))) {
			sprite.position.x = Left + (Math.random() > 0.5 ? 0 : ((Container.glitchAmount || 0) + (extraGlitch || 0)) * glitchMult * (0.5 - Math.random()) * (Math.min(64, Width) || 10));
			sprite.position.y = Top + (Math.random() > 0.5 ? 0 : ((Container.glitchAmount || 0) + (extraGlitch || 0)) * glitchMult * (0.5 - Math.random()) * (Math.min(64, Width) || 10));
		} else {
			sprite.position.x = Left;
			sprite.position.y = Top;
		}
		if (Width)
			sprite.width = Width;
		if (Height)
			sprite.height = Height;
		if (options) {

			if (options.Scale) {
				sprite.scale.x = options.Scale;
				sprite.scale.y = options.Scale;
			}
			if (options.Centered) {
				sprite.anchor.set(0.5);
			}
			if (options.Rotation != undefined)
				sprite.rotation = options.Rotation;

			if (options.filters != undefined)
				sprite.filters = options.filters;
			if (options.tint != undefined)
				sprite.tint = options.tint;
			if (options.alpha != undefined)
				sprite.alpha = options.alpha;

			if (options.zIndex != undefined) {
				sprite.zIndex = options.zIndex;
			}
			if (options.scalex != undefined) {
				sprite.scale.x = sprite.scale.x * options.scalex;
			}
			if (options.scaley != undefined) {
				sprite.scale.y = sprite.scale.y * options.scaley;
			}
			if (options.anchorx != undefined) {
				if (options.normalizeAnchorX) {
					sprite.anchor.x = options.anchorx * (options.normalizeAnchorX/sprite.texture.width);
				} else {
					sprite.anchor.x = options.anchorx;
				}

			}
			if (options.anchory != undefined) {
				if (options.normalizeAnchorY) {
					sprite.anchor.y = options.anchory * (options.normalizeAnchorY/sprite.texture.height);
				} else {
					sprite.anchor.y = options.anchory;
				}
			}
		}
		if (options?.SpritesDrawn)
			options?.SpritesDrawn.set(id, true);
		else
			(Container).spritesDrawn.set(id, true);
		return sprite;
	}
	return null;
}


export function getGlitchColor() {
	let r = Math.random();
	if (r < 0.25) return 0xff0000;
	if (r < 0.5) return 0x00ff00;
	if (r < 0.75) return 0x0000ff;
	return 0xffffff;
}
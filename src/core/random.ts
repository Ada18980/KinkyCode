
export let Seed = (Math.random() * 4294967296).toString();
export let KDRandom = sfc32(xmur3(Seed)(), xmur3(Seed)(), xmur3(Seed)(), xmur3(Seed)());

export function strreplaceAt(str: string, index: number, character: string) {
	return str.substring(0, index) + character + str.substring(index+character.length);
};

/**
 *
 * @param {boolean} Native Decides whether or not to use native KDRandom to randomize
 */
export function RandomizeSeed(Native : boolean) {
	let rand = Native ? KDRandom : () => {return Math.random();};
	Seed = (rand() * 4294967296).toString();
	for (let i = 0; i < 20; i++) {
		let index = rand() * Seed.length;
		Seed = strreplaceAt(Seed, index, String.fromCharCode(65 + Math.floor(rand()*50)) + String.fromCharCode(65 + Math.floor(rand()*50)));
	}
	KDRandom = sfc32(xmur3(Seed)(), xmur3(Seed)(), xmur3(Seed)(), xmur3(Seed)());
	for (let i = 0; i < 1000; i++) {
		KDRandom();
	}
}

export function SetSeed(string: string) {
	Seed = string;
	KDRandom = sfc32(xmur3(Seed)(), xmur3(Seed)(), xmur3(Seed)(), xmur3(Seed)());
	for (let i = 0; i < 1000; i++) {
		KDRandom();
	}
}

/**
 * It takes a string and returns a function that returns a random number
 * @param str - The string to hash.
 * @returns A function that returns a random number.
 */
function xmur3(str: string) {
	let h = 1779033703 ^ str.length;
	for(let i = 0; i < str.length; i++) {
		h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
		h = h << 13 | h >>> 19;
	} return function() {
		h = Math.imul(h ^ (h >>> 16), 2246822507);
		h = Math.imul(h ^ (h >>> 13), 3266489909);
		return (h ^= h >>> 16) >>> 0;
	};
}

/**
 * It takes four 32-bit integers and returns a function that returns a random number between 0 and 1
 * @param a - The first parameter.
 * @param b - 0x9e3779b9
 * @param c - 0x9e3779b9
 * @param d - The seed.
 * @returns A function that returns a random number between 0 and 1.
 */
function sfc32(a: number, b: number, c: number, d: number) {
	return function() {
		a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
		let t = (a + b) | 0;
		a = b ^ b >>> 9;
		b = c + (c << 3) | 0;
		c = (c << 21 | c >>> 11);
		d = d + 1 | 0;
		t = t + d | 0;
		c = c + t | 0;
		return (t >>> 0) / 4294967296;
	};
}